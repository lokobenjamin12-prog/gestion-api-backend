
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RhModule, LogLevel, State } from '@prisma/client';
import { JourAbsence, JourRetard } from 'src/modules/rh/salaire/paie.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { AjouterAbsenceDto } from '../dto/ajouter-absence.dto';
import { extractMoisAnnee, isDateInMonth } from 'src/modules/rh/salaire/jours-ouvrables.util';
import { MettreAJourJourAbsenceDto } from '../dto/mettre-a-jour-jour-absence.dto';
import { SupprimerJourAbsenceDto } from '../dto/supprimer-jour-absencedto';
import { FindAllAbsencesDto } from '../dto/find-all-absences.dto';
import { FindOneAbsenceDto } from '../dto/find-one-absence.dto';
import { RhLogService } from '../../log/rh-log.service';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';

@Injectable()
export class AbsenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rhLog: RhLogService,
    private readonly realtimeGateway: StockRealtimeGateway,
  ) { }

  // ── GARDE : salaire non clôturé ───────────────────────────────────────────
  private async assertSalaireOuvert(userId: string, mois: number, annee: number): Promise<void> {
    const salaire = await this.prisma.salaire.findUnique({
      where: { userId_mois_annee: { userId, mois, annee } },
      select: { estCloture: true },
    });

    if (!salaire) {
      const moisFormate = String(mois).padStart(2, '0');
      throw new NotFoundException(
        `Le salaire de ${moisFormate}/${annee} n'existe pas pour cet utilisateur.`,
      );
    }

    if (salaire.estCloture) {
      const moisFormate = String(mois).padStart(2, '0');
      throw new BadRequestException(
        `Modification impossible : le salaire de ${moisFormate}/${annee} est déjà clôturé.`,
      );
    }
  }

  // ── GARDE : aucun conflit avec les retards du même mois ───────────────────
  private async assertPasDeConflitRetard(
    userId: string,
    mois: number,
    annee: number,
    dates: string[],
  ): Promise<void> {
    if (!userId) throw new BadRequestException(`L'identifiant admin est requis.`);
    if (dates.length === 0) return;

    const retard = await this.prisma.retard.findUnique({
      where: { userId_mois_annee: { userId, mois, annee } },
      select: { jours: true },
    });

    if (!retard?.jours) return;

    const joursRetard = (retard.jours as unknown) as JourRetard[];
    const retardDates = new Set<string>();
    for (let i = 0; i < joursRetard.length; i++) {
      retardDates.add(joursRetard[i].date);
    }

    const aUnConflit = dates.some(d => retardDates.has(d));
    if (aUnConflit) {
      const conflits = dates.filter(d => retardDates.has(d));
      throw new ConflictException(
        `Un retard existe déjà pour les dates suivantes : ${conflits.join(', ')}. ` +
        `Un employé ne peut pas être absent et en retard le même jour.`,
      );
    }
  }

  // ─── AJOUTER DES JOURS D'ABSENCE ─────────────────────────────────────────
  async ajouterJours(dto: AjouterAbsenceDto, actorId: string) {
    if (!actorId) throw new BadRequestException("L'identifiant admin est requis");
    if (!dto.jours || dto.jours.length === 0) return;

    const datesInvalides: string[] = [];
    for (let i = 0; i < dto.jours.length; i++) {
      const d = dto.jours[i].date;
      if (!isDateInMonth(d, dto.mois, dto.annee)) datesInvalides.push(d);
    }
    if (datesInvalides.length > 0) {
      throw new BadRequestException(
        `Dates hors période ${dto.mois}/${dto.annee} : ${datesInvalides.join(', ')}`,
      );
    }

    const userr = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { firstName: true, lastName: true },
    });
    if (!userr) throw new NotFoundException(`L'employé avec l'ID #${dto.userId} est introuvable.`);

    const dates = dto.jours.map(j => j.date);

    const [existing, actorName, user] = await Promise.all([
      this.prisma.absence.findUnique({
        where: { userId_mois_annee: { userId: dto.userId, mois: dto.mois, annee: dto.annee } },
      }),
      this.rhLog.resolveActorName(actorId),
      this.prisma.user.findUnique({
        where: { id: dto.userId },
        select: { firstName: true, lastName: true },
      }),
      this.assertSalaireOuvert(dto.userId, dto.mois, dto.annee),
      this.assertPasDeConflitRetard(dto.userId, dto.mois, dto.annee, dates),
    ]);

    if (!user) throw new NotFoundException(`L'employé avec l'ID #${dto.userId} est introuvable.`);

    const result = await this.prisma.$transaction(async (tx) => {
      let result;

      if (!existing) {
        result = await tx.absence.create({
          data: { userId: dto.userId, mois: dto.mois, annee: dto.annee, jours: dto.jours as any },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        });
      } else {
        const existingJours = (existing.jours as unknown) as JourAbsence[];
        const existingDates = new Set<string>();
        for (let i = 0; i < existingJours.length; i++) existingDates.add(existingJours[i].date);

        const nouveauxJours = dto.jours.filter(j => !existingDates.has(j.date));
        if (nouveauxJours.length === 0) {
          throw new ConflictException('Toutes les dates fournies sont déjà enregistrées.');
        }

        const mergedJours = [...existingJours, ...nouveauxJours].sort((a, b) =>
          a.date.localeCompare(b.date),
        );

        result = await tx.absence.update({
          where: { id: existing.id },
          data: { jours: mergedJours as any },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        });
      }

      const nomEmploye = `${user.firstName} ${user.lastName}`;
      const codeMois = String(dto.mois).padStart(2, '0');

      await this.rhLog.info({
        actorId,
        actorName,
        module: RhModule.ABSENCE,
        action: 'AJOUTER_JOURS_ABSENCE',
        entityId: result.id,
        entityName: `Absences ${codeMois}/${dto.annee} — ${nomEmploye}`,
        apres: { joursAjoutes: dto.jours },
        message: `${dto.jours.length} jour(s) d'absence ajouté(s) pour ${nomEmploye} — ${codeMois}/${dto.annee}`,
      }, tx);

      return result;
    });

    this.realtimeGateway.emitEntityChanged({ module: 'absence', action: 'created', id: dto.userId });
    return result;
  }

  // ─── METTRE À JOUR LA JUSTIFICATION D'UN JOUR ─────────────────────────────
  async mettreAJourJour(dto: MettreAJourJourAbsenceDto, actorId: string) {
    if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

    const { mois, annee } = extractMoisAnnee(dto.date);

    const [absence, actorName] = await Promise.all([
      this.prisma.absence.findUnique({
        where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
      }),
      this.rhLog.resolveActorName(actorId),
      this.assertSalaireOuvert(dto.userId, mois, annee),
    ]);

    if (!absence) {
      const codeMois = String(mois).padStart(2, '0');
      throw new NotFoundException(`Aucune absence enregistrée pour ${codeMois}/${annee}.`);
    }

    const jours = (absence.jours as unknown) as JourAbsence[];
    const idx = jours.findIndex(j => j.date === dto.date);
    if (idx === -1) throw new NotFoundException(`Aucune absence enregistrée pour le ${dto.date}.`);

    const avant = { ...jours[idx] };
    jours[idx] = { date: dto.date, estJustifie: dto.estJustifie };
    const apres = { ...jours[idx] };

    const result = await this.prisma.$transaction(async (tx) => {
      const result = await tx.absence.update({
        where: { id: absence.id },
        data: { jours: jours as any },
      });

      const codeMois = String(mois).padStart(2, '0');
      const statutAvant = avant.estJustifie ? 'Justifiée' : 'Injustifiée';
      const statutApres = apres.estJustifie ? 'Justifiée' : 'Injustifiée';

      await this.rhLog.warn({
        actorId,
        actorName,
        module: RhModule.ABSENCE,
        action: 'MAJ_JUSTIFICATION_ABSENCE',
        entityId: absence.id,
        entityName: `Absence du ${dto.date}`,
        avant,
        apres,
        message: `Absence du ${dto.date} mise à jour : ${statutAvant} → ${statutApres} — ${codeMois}/${annee}`,
      }, tx);

      return result;
    });

    this.realtimeGateway.emitEntityChanged({ module: 'absence', action: 'updated', id: dto.userId });
    return result;
  }

  // ─── SUPPRIMER UN JOUR D'ABSENCE ──────────────────────────────────────────
  async supprimerJour(dto: SupprimerJourAbsenceDto, actorId: string) {
    if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

    const { mois, annee } = extractMoisAnnee(dto.date);

    const [absence, actorName] = await Promise.all([
      this.prisma.absence.findUnique({
        where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
      }),
      this.rhLog.resolveActorName(actorId),
      this.assertSalaireOuvert(dto.userId, mois, annee),
    ]);

    if (!absence) {
      const codeMois = String(mois).padStart(2, '0');
      throw new NotFoundException(`Aucune absence pour ${codeMois}/${annee}.`);
    }

    const jours = (absence.jours as unknown) as JourAbsence[];
    const jourSupprime = jours.find(j => j.date === dto.date);
    if (!jourSupprime) throw new NotFoundException(`Absence du ${dto.date} introuvable.`);

    const nouveauxJours = jours.filter(j => j.date !== dto.date);

    const result = await this.prisma.$transaction(async (tx) => {
      let result: any = null;

      if (nouveauxJours.length === 0) {
        await tx.absence.delete({ where: { id: absence.id } });
      } else {
        result = await tx.absence.update({
          where: { id: absence.id },
          data: { jours: nouveauxJours as any },
        });
      }

      const statutOriginal = jourSupprime.estJustifie ? 'justifiée' : 'injustifiée';

      await this.rhLog.warn({
        actorId,
        actorName,
        module: RhModule.ABSENCE,
        action: 'SUPPRIMER_JOUR_ABSENCE',
        entityId: absence.id,
        entityName: `Absence du ${dto.date}`,
        avant: jourSupprime,
        message: `Absence du ${dto.date} supprimée (était ${statutOriginal})`,
      }, tx);

      return result;
    });

    this.realtimeGateway.emitEntityChanged({ module: 'absence', action: 'deleted', id: dto.userId });
    return result;
  }

  // ─── LECTURES ─────────────────────────────────────────────────────────────
  async findAll(dto: FindAllAbsencesDto) {
    const where: any = {};
    if (dto.userId) where.userId = dto.userId;
    if (dto.mois) where.mois = dto.mois;
    if (dto.annee) where.annee = dto.annee;

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.absence.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } } },
        orderBy: [{ annee: 'desc' }, { mois: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.absence.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(dto: FindOneAbsenceDto) {
    const { userId, mois, annee } = dto;

    const absence = await this.prisma.absence.findUnique({
      where: { userId_mois_annee: { userId, mois, annee } },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } } },
    });

    if (!absence) {
      const codeMois = String(mois).padStart(2, '0');
      throw new NotFoundException(`Aucune absence pour cet employé en ${codeMois}/${annee}.`);
    }

    return absence;
  }
}
