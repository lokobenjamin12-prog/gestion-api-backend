
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RhModule, LogLevel, State } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AjouterRetardDto } from '../dto/ajouter-retard-dto';
import { extractMoisAnnee, isDateInMonth } from 'src/modules/rh/salaire/jours-ouvrables.util';
import { JourAbsence, JourRetard } from 'src/modules/rh/salaire/paie.types';
import { MettreAJourJourRetardDto } from '../dto/mettreAjour-jour-retard.dto';
import { SupprimerJourRetardDto } from '../dto/supprimer-jour-retard.dto';
import { FindAllRetardsDto } from '../dto/find-all-retards.dto';
import { FindOneRetardDto } from '../dto/find-one-retard-dto';
import { RhLogService } from '../../log/rh-log.service';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';

@Injectable()
export class RetardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rhLog: RhLogService,
    private readonly realtimeGateway: StockRealtimeGateway,
  ) {}

  // ── GARDE : salaire non clôturé ──────────────────────────────────────────
  private async assertSalaireOuvert(userId: string, mois: number, annee: number): Promise<void> {
    const salaire = await this.prisma.salaire.findUnique({
      where: { userId_mois_annee: { userId, mois, annee } },
      select: { estCloture: true },
    });

    if (!salaire) {
      const codeMois = String(mois).padStart(2, '0');
      throw new BadRequestException(
        `Modification impossible : la période de paie ${codeMois}/${annee} n'est pas encore initialisée.`,
      );
    }

    if (salaire.estCloture) {
      const codeMois = String(mois).padStart(2, '0');
      throw new BadRequestException(
        `Modification impossible : le salaire de ${codeMois}/${annee} est déjà clôturé.`,
      );
    }
  }

  // ── GARDE : aucun conflit avec les absences du même mois ─────────────────
  private async assertPasDeConflitAbsence(
    userId: string,
    mois: number,
    annee: number,
    dates: string[],
  ): Promise<void> {
    const absence = await this.prisma.absence.findUnique({
      where: { userId_mois_annee: { userId, mois, annee } },
      select: { jours: true },
    });

    if (!absence) return;

    const joursAbsence = (absence.jours as unknown) as JourAbsence[];
    const absenceDates = new Set<string>();
    for (let i = 0; i < joursAbsence.length; i++) absenceDates.add(joursAbsence[i].date);

    const conflits: string[] = [];
    for (let i = 0; i < dates.length; i++) {
      if (absenceDates.has(dates[i])) conflits.push(dates[i]);
    }

    if (conflits.length > 0) {
      throw new ConflictException(
        `Une absence existe déjà pour les dates suivantes : ${conflits.join(', ')}. ` +
        `Un employé ne peut pas être en retard et absent le même jour.`,
      );
    }
  }

  // ─── AJOUTER DES JOURS DE RETARD ──────────────────────────────────────────
  async ajouterJours(dto: AjouterRetardDto, actorId: string) {
    if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

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
      this.prisma.retard.findUnique({
        where: { userId_mois_annee: { userId: dto.userId, mois: dto.mois, annee: dto.annee } },
      }),
      this.rhLog.resolveActorName(actorId),
      this.prisma.user.findUnique({
        where: { id: dto.userId },
        select: { firstName: true, lastName: true },
      }),
      this.assertSalaireOuvert(dto.userId, dto.mois, dto.annee),
      this.assertPasDeConflitAbsence(dto.userId, dto.mois, dto.annee, dates),
    ]);

    if (!user) throw new NotFoundException(`Employé #${dto.userId} introuvable`);

    const result = await this.prisma.$transaction(async (tx) => {
      let result;

      if (!existing) {
        result = await tx.retard.create({
          data: { userId: dto.userId, mois: dto.mois, annee: dto.annee, jours: dto.jours as any },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        });
      } else {
        const existingJours = (existing.jours as unknown) as JourRetard[];
        const existingDates = new Set<string>();
        for (let i = 0; i < existingJours.length; i++) existingDates.add(existingJours[i].date);

        const nouveauxJours = dto.jours.filter(j => !existingDates.has(j.date));
        if (nouveauxJours.length === 0) {
          throw new ConflictException('Toutes les dates fournies sont déjà enregistrées dans les retards du mois.');
        }

        const mergedJours = [...existingJours, ...nouveauxJours].sort((a, b) =>
          a.date.localeCompare(b.date),
        );

        result = await tx.retard.update({
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
        module: RhModule.RETARD,
        action: 'AJOUTER_JOURS_RETARD',
        entityId: result.id,
        entityName: `Retards ${codeMois}/${dto.annee} — ${nomEmploye}`,
        apres: { joursAjoutes: dto.jours },
        message: `${dto.jours.length} jour(s) de retard ajouté(s) pour ${nomEmploye} — ${codeMois}/${dto.annee}`,
      }, tx);

      return result;
    });

    this.realtimeGateway.emitEntityChanged({ module: 'retard', action: 'created', id: dto.userId });
    return result;
  }

  // ─── METTRE À JOUR LA JUSTIFICATION D'UN JOUR ─────────────────────────────
  async mettreAJourJour(dto: MettreAJourJourRetardDto, actorId: string) {
    if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

    const { mois, annee } = extractMoisAnnee(dto.date);

    const [retard, actorName] = await Promise.all([
      this.prisma.retard.findUnique({
        where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
      }),
      this.rhLog.resolveActorName(actorId),
      this.assertSalaireOuvert(dto.userId, mois, annee),
    ]);

    if (!retard) {
      const codeMois = String(mois).padStart(2, '0');
      throw new NotFoundException(`Aucun retard enregistré pour ${codeMois}/${annee}.`);
    }

    const jours = (retard.jours as unknown) as JourRetard[];
    const idx = jours.findIndex(j => j.date === dto.date);
    if (idx === -1) throw new NotFoundException(`Aucun retard enregistré pour le ${dto.date}.`);

    const avant = { ...jours[idx] };
    jours[idx] = { date: dto.date, estJustifie: dto.estJustifie };
    const apres = { ...jours[idx] };

    const result = await this.prisma.$transaction(async (tx) => {
      const result = await tx.retard.update({
        where: { id: retard.id },
        data: { jours: jours as any },
      });

      const statutAvant = avant.estJustifie ? 'Justifié' : 'Injustifié';
      const statutApres = apres.estJustifie ? 'Justifié' : 'Injustifié';

      await this.rhLog.warn({
        actorId,
        actorName,
        module: RhModule.RETARD,
        action: 'MAJ_JUSTIFICATION_RETARD',
        entityId: retard.id,
        entityName: `Retard du ${dto.date}`,
        avant,
        apres,
        message: `Retard du ${dto.date} mis à jour : ${statutAvant} → ${statutApres}`,
      }, tx);

      return result;
    });

    this.realtimeGateway.emitEntityChanged({ module: 'retard', action: 'updated', id: dto.userId });
    return result;
  }

  // ─── SUPPRIMER UN JOUR DE RETARD ──────────────────────────────────────────
  async supprimerJour(dto: SupprimerJourRetardDto, actorId: string) {
    if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

    const { mois, annee } = extractMoisAnnee(dto.date);

    const [retard, actorName] = await Promise.all([
      this.prisma.retard.findUnique({
        where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
      }),
      this.rhLog.resolveActorName(actorId),
      this.assertSalaireOuvert(dto.userId, mois, annee),
    ]);

    if (!retard) {
      const codeMois = String(mois).padStart(2, '0');
      throw new NotFoundException(`Aucun retard pour ${codeMois}/${annee}.`);
    }

    const jours = (retard.jours as unknown) as JourRetard[];
    const jourSupprime = jours.find(j => j.date === dto.date);
    if (!jourSupprime) throw new NotFoundException(`Retard du ${dto.date} introuvable.`);

    const nouveauxJours = jours.filter(j => j.date !== dto.date);

    const result = await this.prisma.$transaction(async (tx) => {
      let result: any = null;

      if (nouveauxJours.length === 0) {
        await tx.retard.delete({ where: { id: retard.id } });
      } else {
        result = await tx.retard.update({
          where: { id: retard.id },
          data: { jours: nouveauxJours as any },
        });
      }

      const statutOriginal = jourSupprime.estJustifie ? 'justifié' : 'injustifié';

      await this.rhLog.warn({
        actorId,
        actorName,
        module: RhModule.RETARD,
        action: 'SUPPRIMER_JOUR_RETARD',
        entityId: retard.id,
        entityName: `Retard du ${dto.date}`,
        avant: jourSupprime,
        message: `Retard du ${dto.date} supprimé (était ${statutOriginal})`,
      }, tx);

      return result;
    });

    this.realtimeGateway.emitEntityChanged({ module: 'retard', action: 'deleted', id: dto.userId });
    return result;
  }

  // ─── LECTURES ─────────────────────────────────────────────────────────────
  async findAll(dto: FindAllRetardsDto) {
    const where: any = {};
    if (dto.userId) where.userId = dto.userId;
    if (dto.mois) where.mois = dto.mois;
    if (dto.annee) where.annee = dto.annee;

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.retard.count({ where }),
      this.prisma.retard.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } } },
        orderBy: [{ annee: 'desc' }, { mois: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(dto: FindOneRetardDto) {
    const { userId, mois, annee } = dto;

    const retard = await this.prisma.retard.findUnique({
      where: { userId_mois_annee: { userId, mois, annee } },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } } },
    });

    if (!retard) {
      const codeMois = String(mois).padStart(2, '0');
      throw new NotFoundException(`Aucun retard pour cet employé en ${codeMois}/${annee}.`);
    }

    return retard;
  }
}



















// // retard.service.ts
// import {
//   BadRequestException,
//   ConflictException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { AjouterRetardDto } from '../dto/ajouter-retard-dto';
// import { extractMoisAnnee, isDateInMonth } from 'src/modules/rh/salaire/jours-ouvrables.util';
// import { JourAbsence, JourRetard } from 'src/modules/rh/salaire/paie.types';
// import { AuditModule, LogLevel, State } from '@prisma/client';
// import { MettreAJourJourRetardDto } from '../dto/mettreAjour-jour-retard.dto';
// import { SupprimerJourRetardDto } from '../dto/supprimer-jour-retard.dto';
// import { FindAllRetardsDto } from '../dto/find-all-retards.dto';
// import { FindOneRetardDto } from '../dto/find-one-retard-dto';
// import { AuditService } from 'src/modules/admin/audit/services/audit.service';



// @Injectable()
// export class RetardService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly audit: AuditService,
//   ) { }

//   // ── GARDE : salaire non clôturé ──────────────────────────────────────────
//   private async assertSalaireOuvert(
//     userId: string,
//     mois: number,
//     annee: number,
//   ): Promise<void> {
//     const salaire = await this.prisma.salaire.findUnique({
//       where: { userId_mois_annee: { userId, mois, annee } },
//       select: { estCloture: true },
//     });

//     // 1. CAS N°1 : Le salaire n'existe pas encore pour ce mois
//     if (!salaire) {
//       const codeMois = String(mois).padStart(2, '0');
//       throw new BadRequestException(
//         `Modification impossible : la période de paie ${codeMois}/${annee} n'est pas encore initialisée.`,
//       );
//     }

//     // 2. CAS N°2 : Le salaire existe mais est verrouillé
//     if (salaire.estCloture) {
//       const codeMois = String(mois).padStart(2, '0');
//       throw new BadRequestException(
//         `Modification impossible : le salaire de ${codeMois}/${annee} est déjà clôturé.`,
//       );
//     }
//   }

//   // ── GARDE : aucun conflit avec les absences du même mois ─────────────────
//   private async assertPasDeConflitAbsence(
//     userId: string,
//     mois: number,
//     annee: number,
//     dates: string[],
//   ): Promise<void> {
//     const absence = await this.prisma.absence.findUnique({
//       where: { userId_mois_annee: { userId, mois, annee } },
//       select: { jours: true },
//     });

//     if (!absence) return;

//     // 1. Correction du typage JSON Prisma (Double cast via unknown)
//     const joursAbsence = (absence.jours as unknown) as JourAbsence[];

//     // 2. OPTIMISATION MÉMOIRE : On remplit le Set directement via une boucle for
//     // Évite la création d'un tableau intermédiaire éphémère provoqué par .map()
//     const absenceDates = new Set<string>();
//     for (let i = 0; i < joursAbsence.length; i++) {
//       absenceDates.add(joursAbsence[i].date);
//     }

//     // 3. Recherche des conflits (court-circuit dès le premier conflit trouvé)
//     const conflits: string[] = [];
//     for (let i = 0; i < dates.length; i++) {
//       if (absenceDates.has(dates[i])) {
//         conflits.push(dates[i]);
//       }
//     }

//     // 4. Lazy formatting de l'erreur
//     if (conflits.length > 0) {
//       throw new ConflictException(
//         `Une absence existe déjà pour les dates suivantes : ${conflits.join(', ')}. ` +
//         `Un employé ne peut pas être en retard et absent le même jour.`,
//       );
//     }
//   }

//   // ─────────────────────────────────────────────────────────────────────────
//   // AJOUTER DES JOURS DE RETARD
//   // ─────────────────────────────────────────────────────────────────────────
//   async ajouterJours(dto: AjouterRetardDto, actorId: string) {
//     if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

//     // 1. Validation immédiate avec une boucle for simple (Évite le filter + map)
//     const datesInvalides: string[] = [];
//     for (let i = 0; i < dto.jours.length; i++) {
//       const d = dto.jours[i].date;
//       if (!isDateInMonth(d, dto.mois, dto.annee)) {
//         datesInvalides.push(d);
//       }
//     }

//     if (datesInvalides.length > 0) {
//       throw new BadRequestException(
//         `Dates hors période ${dto.mois}/${dto.annee} : ${datesInvalides.join(', ')}`,
//       );
//     }

//     // 2. Vérification immédiate de l'utilisateur (Fail-Fast)
//     const userr = await this.prisma.user.findUnique({
//       where: { id: dto.userId },
//       select: { firstName: true, lastName: true },
//     });

//     if (!userr) {
//       throw new NotFoundException(`L'employé avec l'ID #${dto.userId} est introuvable ou n'existe pas.`);
//     }

//     const dates = dto.jours.map(j => j.date);

//     const [existing, actorName, user] = await Promise.all([
//       this.prisma.retard.findUnique({
//         where: { userId_mois_annee: { userId: dto.userId, mois: dto.mois, annee: dto.annee } },
//       }),
//       this.audit.resolveActorName(actorId),
//       this.prisma.user.findUnique({
//         where: { id: dto.userId },
//         select: { firstName: true, lastName: true },
//       }),
//       this.assertSalaireOuvert(dto.userId, dto.mois, dto.annee),
//       this.assertPasDeConflitAbsence(dto.userId, dto.mois, dto.annee, dates),
//     ]);

//     // Vérification après le Promise.all
//     if (!user) {
//       throw new NotFoundException(`Employé #${dto.userId} introuvable`);
//     }

//     return this.prisma.$transaction(async (tx) => {
//       let result;

//       if (!existing) {
//         // Création du premier enregistrement
//         result = await tx.retard.create({
//           data: {
//             userId: dto.userId,
//             mois: dto.mois,
//             annee: dto.annee,
//             jours: dto.jours as any, // Cast "as any" pour bypasser la sécurité stricte JSON de Prisma
//           },
//           include: { user: { select: { id: true, firstName: true, lastName: true } } },
//         });
//       } else {
//         // Fusion des jours : Optimisation du Set via une boucle classique
//         const existingJours = (existing.jours as unknown) as JourRetard[];
//         const existingDates = new Set<string>();

//         for (let i = 0; i < existingJours.length; i++) {
//           existingDates.add(existingJours[i].date);
//         }

//         const nouveauxJours = dto.jours.filter(j => !existingDates.has(j.date));

//         if (nouveauxJours.length === 0) {
//           throw new ConflictException(
//             'Toutes les dates fournies sont déjà enregistrées dans les retards du mois.',
//           );
//         }

//         const mergedJours = [...existingJours, ...nouveauxJours].sort((a, b) =>
//           a.date.localeCompare(b.date),
//         );

//         result = await tx.retard.update({
//           where: { id: existing.id },
//           data: { jours: mergedJours as any }, // Cast "as any" pour l'écriture
//           include: { user: { select: { id: true, firstName: true, lastName: true } } },
//         });
//       }

//       // 3. Évaluation paresseuse (Lazy Evaluation) à l'intérieur de la transaction
//       const nomEmploye = user ? `${user.firstName} ${user.lastName}` : dto.userId;
//       const codeMois = String(dto.mois).padStart(2, '0');

//       await this.audit.log({
//         actorId,
//         actorName,
//         module: AuditModule.RETARD,
//         action: 'AJOUTER_JOURS_RETARD',
//         level: LogLevel.INFO,
//         entityId: result.id,
//         entityName: `Retards ${codeMois}/${dto.annee} — ${nomEmploye}`,
//         apres: { joursAjoutes: dto.jours },
//         message: `${dto.jours.length} jour(s) de retard ajouté(s) pour ${nomEmploye} — ${codeMois}/${dto.annee}`,
//       }, tx);

//       return result;
//     });
//   }


//   // ─────────────────────────────────────────────────────────────────────────
//   // METTRE À JOUR LA JUSTIFICATION D'UN JOUR
//   // ─────────────────────────────────────────────────────────────────────────
//   async mettreAJourJour(dto: MettreAJourJourRetardDto, actorId: string) {
//     if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

//     const { mois, annee } = extractMoisAnnee(dto.date);

//     // 1. PARALLÉLISATION : On lance les 3 requêtes de lecture en même temps (Gain I/O important)
//     const [retard, actorName] = await Promise.all([
//       this.prisma.retard.findUnique({
//         where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
//       }),
//       this.audit.resolveActorName(actorId),
//       this.assertSalaireOuvert(dto.userId, mois, annee),
//     ]);

//     // 2. Vérification de l'existence de l'enregistrement global du mois
//     if (!retard) {
//       const codeMois = String(mois).padStart(2, '0');
//       throw new NotFoundException(
//         `Aucun retard enregistré pour ${codeMois}/${annee}.`,
//       );
//     }

//     // 3. Extraction sécurisée du JSON (Double cast indispensable pour TypeScript/Prisma)
//     const jours = (retard.jours as unknown) as JourRetard[];

//     // 4. Ciblage de l'index du jour à modifier
//     const idx = jours.findIndex(j => j.date === dto.date);
//     if (idx === -1) {
//       throw new NotFoundException(`Aucun retard enregistré pour le ${dto.date}.`);
//     }

//     // 5. Création des snapshots avant/après (shallow copy)
//     const avant = { ...jours[idx] };
//     jours[idx] = { date: dto.date, estJustifie: dto.estJustifie };
//     const apres = { ...jours[idx] };

//     // 6. Exécution de la transaction d'écriture et d'audit
//     return this.prisma.$transaction(async (tx) => {
//       const result = await tx.retard.update({
//         where: { id: retard.id },
//         data: { jours: jours as any }, // Cast "as any" pour valider l'écriture JSON
//       });

//       // Évaluation paresseuse du message (Calculé uniquement si la transaction s'exécute avec succès)
//       const statutAvant = avant.estJustifie ? 'Justifié' : 'Injustifié';
//       const statutApres = apres.estJustifie ? 'Justifié' : 'Injustifié';

//       await this.audit.log({
//         actorId,
//         actorName,
//         module: AuditModule.RETARD,
//         action: 'MAJ_JUSTIFICATION_RETARD',
//         level: LogLevel.WARNING,
//         entityId: retard.id,
//         entityName: `Retard du ${dto.date}`,
//         avant,
//         apres,
//         message: `Retard du ${dto.date} mis à jour : ${statutAvant} → ${statutApres}`,
//       }, tx);

//       return result;
//     });
//   }

//   // ─────────────────────────────────────────────────────────────────────────
//   // SUPPRIMER UN JOUR DE RETARD
//   // ─────────────────────────────────────────────────────────────────────────
//   async supprimerJour(dto: SupprimerJourRetardDto, actorId: string) {
//     if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

//     const { mois, annee } = extractMoisAnnee(dto.date);

//     // 1. PARALLÉLISATION : On lance les 3 requêtes asynchrones en même temps
//     const [retard, actorName] = await Promise.all([
//       this.prisma.retard.findUnique({
//         where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
//       }),
//       this.audit.resolveActorName(actorId),
//       this.assertSalaireOuvert(dto.userId, mois, annee),
//     ]);

//     // 2. Vérification si l'enregistrement global du mois existe
//     if (!retard) {
//       const codeMois = String(mois).padStart(2, '0');
//       throw new NotFoundException(
//         `Aucun retard pour ${codeMois}/${annee}.`,
//       );
//     }

//     // 3. Extraction sécurisée du JSON (Double cast pour TypeScript)
//     const jours = (retard.jours as unknown) as JourRetard[];

//     // 4. Recherche de la date à supprimer
//     const jourSupprime = jours.find(j => j.date === dto.date);
//     if (!jourSupprime) {
//       throw new NotFoundException(`Retard du ${dto.date} introuvable.`);
//     }

//     // 5. Filtrage pour retirer le jour ciblé
//     const nouveauxJours = jours.filter(j => j.date !== dto.date);

//     // 6. Exécution de la transaction (Écriture + Log)
//     return this.prisma.$transaction(async (tx) => {
//       let result: any = null;

//       if (nouveauxJours.length === 0) {
//         // Plus aucun jour → on supprime complètement l'enregistrement du mois
//         await tx.retard.delete({ where: { id: retard.id } });
//       } else {
//         // Il reste des jours → simple mise à jour avec le cast "as any"
//         result = await tx.retard.update({
//           where: { id: retard.id },
//           data: { jours: nouveauxJours as any },
//         });
//       }

//       // Évaluation paresseuse du message de log (uniquement si la transaction réussit)
//       const statutOriginal = jourSupprime.estJustifie ? 'justifié' : 'injustifié';

//       await this.audit.log({
//         actorId,
//         actorName,
//         module: AuditModule.RETARD,
//         action: 'SUPPRIMER_JOUR_RETARD',
//         level: LogLevel.WARNING,
//         entityId: retard.id,
//         entityName: `Retard du ${dto.date}`,
//         avant: jourSupprime,
//         message: `Retard du ${dto.date} supprimé (était ${statutOriginal})`,
//       }, tx);

//       return result;
//     });
//   }

//   // ─────────────────────────────────────────────────────────────────────────
//   // LECTURES
//   // ─────────────────────────────────────────────────────────────────────────

//   /* async findAll(dto: FindAllRetardsDto) {
//        const where: any = {};
 
//        // 1. Extraction propre des filtres métiers
//        if (dto.userId) where.userId = dto.userId;
//        if (dto.mois) where.mois = dto.mois;
//        if (dto.annee) where.annee = dto.annee;
 
//        // 2. Calcul des variables de pagination
//        const page = dto.page ?? 1;
//        const limit = dto.limit ?? 10;
//        const skip = (page - 1) * limit;
 
//        // 3. Double requête parallèle (Données de la page + Nombre total pour le Front)
//        const [data, total] = await Promise.all([
//            this.prisma.retard.findMany({
//                where,
//                include: {
//                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
//                },
//                orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
//                skip,
//                take: limit,
//            }),
//            this.prisma.retard.count({ where }),
//        ]);
 
//        // 4. Format de réponse standardisé (Data / Meta)
//        return {
//            data,
//            meta: {
//                total,
//                page,
//                limit,
//                totalPages: Math.ceil(total / limit),
//            },
//        };
//    }*/
//   async findAll(dto: FindAllRetardsDto) {
//     const where: any = {};

//     // 1. Extraction propre des filtres métiers
//     if (dto.userId) where.userId = dto.userId;
//     if (dto.mois) where.mois = dto.mois;
//     if (dto.annee) where.annee = dto.annee;

//     // 2. Calcul des variables de pagination
//     const page = dto.page ?? 1;
//     const limit = dto.limit ?? 10;
//     const skip = (page - 1) * limit;

//     // 3. Double requête parallèle
//     const [total, data] = await Promise.all([
//       this.prisma.retard.count({ where }),
//       this.prisma.retard.findMany({
//         where,
//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               email: true,
//             },
//           },
//         },
//         orderBy: [
//           { annee: 'desc' },
//           { mois: 'desc' },
//           { createdAt: 'desc' }, // ← tiebreaker
//         ],
//         skip,
//         take: limit,
//       }),
//     ]);

//     // 4. Format de réponse standardisé
//     return {
//       data,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//         hasNextPage: page * limit < total,
//         hasPreviousPage: page > 1,
//       },
//     };
//   }

//   async findOne(dto: FindOneRetardDto) {
//     const { userId, mois, annee } = dto;

//     const retard = await this.prisma.retard.findUnique({
//       where: { userId_mois_annee: { userId, mois, annee } },
//       include: {
//         user: { select: { id: true, firstName: true, lastName: true, email: true } },
//       },
//     });

//     if (!retard) {
//       // OPTIMISATION CPU & MÉMOIRE : Le formatage s'exécute UNIQUEMENT en cas d'erreur
//       const codeMois = String(mois).padStart(2, '0');
//       throw new NotFoundException(
//         `Aucun retard pour cet employé en ${codeMois}/${annee}.`,
//       );
//     }

//     return retard;
//   }
// }


// @Injectable()
// export class RetardService {
//   constructor(
//     private readonly prisma:     PrismaService,
//     private readonly logService: LogService, // ← audit removed

//   ) {}

//   // ── GARDE : salaire non clôturé ───────────────────────────────────────────
//   private async assertSalaireOuvert(
//     userId: string,
//     mois:   number,
//     annee:  number,
//   ): Promise<void> {
//     const salaire = await this.prisma.salaire.findUnique({
//       where:  { userId_mois_annee: { userId, mois, annee } },
//       select: { estCloture: true },
//     });

//     if (!salaire) {
//       throw new BadRequestException(
//         `Modification impossible : la période de paie ${String(mois).padStart(2, '0')}/${annee} n'est pas encore initialisée.`,
//       );
//     }
//     if (salaire.estCloture) {
//       throw new BadRequestException(
//         `Modification impossible : le salaire de ${String(mois).padStart(2, '0')}/${annee} est déjà clôturé.`,
//       );
//     }
//   }

//   // ── GARDE : aucun conflit avec les absences du même mois ──────────────────
//   private async assertPasDeConflitAbsence(
//     userId: string,
//     mois:   number,
//     annee:  number,
//     dates:  string[],
//   ): Promise<void> {
//     const absence = await this.prisma.absence.findUnique({
//       where:  { userId_mois_annee: { userId, mois, annee } },
//       select: { jours: true },
//     });

//     if (!absence) return;

//     const joursAbsence = (absence.jours as unknown) as JourAbsence[];
//     const absenceDates = new Set<string>();
//     for (let i = 0; i < joursAbsence.length; i++) {
//       absenceDates.add(joursAbsence[i].date);
//     }

//     const conflits: string[] = [];
//     for (let i = 0; i < dates.length; i++) {
//       if (absenceDates.has(dates[i])) conflits.push(dates[i]);
//     }

//     if (conflits.length > 0) {
//       throw new ConflictException(
//         `Une absence existe déjà pour les dates suivantes : ${conflits.join(', ')}. ` +
//         `Un employé ne peut pas être en retard et absent le même jour.`,
//       );
//     }
//   }

//   // ─── AJOUTER DES JOURS DE RETARD ─────────────────────────────────────────
//   async ajouterJours(dto: AjouterRetardDto, actorId: string) {
//     if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

//     // Validation des dates hors période
//     const datesInvalides: string[] = [];
//     for (let i = 0; i < dto.jours.length; i++) {
//       if (!isDateInMonth(dto.jours[i].date, dto.mois, dto.annee)) {
//         datesInvalides.push(dto.jours[i].date);
//       }
//     }
//     if (datesInvalides.length > 0) {
//       throw new BadRequestException(
//         `Dates hors période ${dto.mois}/${dto.annee} : ${datesInvalides.join(', ')}`,
//       );
//     }

//     // Vérification immédiate de l'utilisateur
//     const userCheck = await this.prisma.user.findUnique({
//       where:  { id: dto.userId },
//       select: { firstName: true, lastName: true },
//     });
//     if (!userCheck) {
//       throw new NotFoundException(
//         `L'employé avec l'ID #${dto.userId} est introuvable ou n'existe pas.`,
//       );
//     }

//     const dates = dto.jours.map((j) => j.date);

//     // Parallélisation : toutes les lectures en une seule vague
//     const [existing, user] = await Promise.all([
//       this.prisma.retard.findUnique({
//         where: { userId_mois_annee: { userId: dto.userId, mois: dto.mois, annee: dto.annee } },
//       }),
//       this.prisma.user.findUnique({
//         where:  { id: dto.userId },
//         select: { firstName: true, lastName: true },
//       }),
//       this.assertSalaireOuvert(dto.userId, dto.mois, dto.annee),
//       this.assertPasDeConflitAbsence(dto.userId, dto.mois, dto.annee, dates),
//     ]);

//     if (!user) {
//       throw new NotFoundException(`Employé #${dto.userId} introuvable`);
//     }

//     return this.prisma.$transaction(async (tx) => {
//       let result: any;

//       if (!existing) {
//         result = await tx.retard.create({
//           data: {
//             userId: dto.userId,
//             mois:   dto.mois,
//             annee:  dto.annee,
//             jours:  dto.jours as any,
//           },
//           include: { user: { select: { id: true, firstName: true, lastName: true } } },
//         });
//       } else {
//         const existingJours = (existing.jours as unknown) as JourRetard[];
//         const existingDates = new Set<string>();
//         for (let i = 0; i < existingJours.length; i++) {
//           existingDates.add(existingJours[i].date);
//         }

//         const nouveauxJours = dto.jours.filter((j) => !existingDates.has(j.date));
//         if (nouveauxJours.length === 0) {
//           throw new ConflictException(
//             'Toutes les dates fournies sont déjà enregistrées dans les retards du mois.',
//           );
//         }

//         const mergedJours = [...existingJours, ...nouveauxJours].sort((a, b) =>
//           a.date.localeCompare(b.date),
//         );

//         result = await tx.retard.update({
//           where:   { id: existing.id },
//           data:    { jours: mergedJours as any },
//           include: { user: { select: { id: true, firstName: true, lastName: true } } },
//         });
//       }

//       const nomEmploye = `${user.firstName} ${user.lastName}`;
//       const codeMois   = String(dto.mois).padStart(2, '0');

//       await this.logService.createLog({
//         userId:  actorId,
//         module:  'RETARD',
//         action:  'AJOUTER_JOURS_RETARD',
//         message: `${dto.jours.length} jour(s) de retard ajouté(s) pour ${nomEmploye} — ${codeMois}/${dto.annee}`,
//         state:   State.SUCCESS,
//       }, tx);

//       return result;
//     });
//   }

//   // ─── METTRE À JOUR LA JUSTIFICATION D'UN JOUR ────────────────────────────
//   async mettreAJourJour(dto: MettreAJourJourRetardDto, actorId: string) {
//     if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

//     const { mois, annee } = extractMoisAnnee(dto.date);

//     const [retard] = await Promise.all([
//       this.prisma.retard.findUnique({
//         where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
//       }),
//       this.assertSalaireOuvert(dto.userId, mois, annee),
//     ]);

//     if (!retard) {
//       throw new NotFoundException(
//         `Aucun retard enregistré pour ${String(mois).padStart(2, '0')}/${annee}.`,
//       );
//     }

//     const jours = (retard.jours as unknown) as JourRetard[];
//     const idx   = jours.findIndex((j) => j.date === dto.date);
//     if (idx === -1) {
//       throw new NotFoundException(`Aucun retard enregistré pour le ${dto.date}.`);
//     }

//     const avant  = { ...jours[idx] };
//     jours[idx]   = { date: dto.date, estJustifie: dto.estJustifie };
//     const apres  = { ...jours[idx] };

//     return this.prisma.$transaction(async (tx) => {
//       const result = await tx.retard.update({
//         where: { id: retard.id },
//         data:  { jours: jours as any },
//       });

//       const statutAvant = avant.estJustifie  ? 'Justifié'   : 'Injustifié';
//       const statutApres = apres.estJustifie  ? 'Justifié'   : 'Injustifié';

//       await this.logService.createLog({
//         userId:  actorId,
//         module:  'RETARD',
//         action:  'MAJ_JUSTIFICATION_RETARD',
//         level:   LogLevel.WARNING,
//         message: `Retard du ${dto.date} mis à jour : ${statutAvant} → ${statutApres}`,
//         state:   State.SUCCESS,
//       }, tx);

//       return result;
//     });
//   }

//   // ─── SUPPRIMER UN JOUR DE RETARD ──────────────────────────────────────────
//   async supprimerJour(dto: SupprimerJourRetardDto, actorId: string) {
//     if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

//     const { mois, annee } = extractMoisAnnee(dto.date);

//     const [retard] = await Promise.all([
//       this.prisma.retard.findUnique({
//         where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
//       }),
//       this.assertSalaireOuvert(dto.userId, mois, annee),
//     ]);

//     if (!retard) {
//       throw new NotFoundException(
//         `Aucun retard pour ${String(mois).padStart(2, '0')}/${annee}.`,
//       );
//     }

//     const jours        = (retard.jours as unknown) as JourRetard[];
//     const jourSupprime = jours.find((j) => j.date === dto.date);
//     if (!jourSupprime) {
//       throw new NotFoundException(`Retard du ${dto.date} introuvable.`);
//     }

//     const nouveauxJours = jours.filter((j) => j.date !== dto.date);

//     return this.prisma.$transaction(async (tx) => {
//       let result: any = null;

//       if (nouveauxJours.length === 0) {
//         await tx.retard.delete({ where: { id: retard.id } });
//       } else {
//         result = await tx.retard.update({
//           where: { id: retard.id },
//           data:  { jours: nouveauxJours as any },
//         });
//       }

//       const statutOriginal = jourSupprime.estJustifie ? 'justifié' : 'injustifié';

//       await this.logService.createLog({
//         userId:  actorId,
//         module:  'RETARD',
//         action:  'SUPPRIMER_JOUR_RETARD',
//         level:   LogLevel.WARNING,
//         message: `Retard du ${dto.date} supprimé (était ${statutOriginal})`,
//         state:   State.SUCCESS,
//       }, tx);

//       return result;
//     });
//   }

//   // ─── FIND ALL ─────────────────────────────────────────────────────────────
//   async findAll(dto: FindAllRetardsDto) {
//     const where: any = {};
//     if (dto.userId) where.userId = dto.userId;
//     if (dto.mois)   where.mois   = dto.mois;
//     if (dto.annee)  where.annee  = dto.annee;

//     const page  = dto.page  ?? 1;
//     const limit = dto.limit ?? 10;
//     const skip  = (page - 1) * limit;

//     const [total, data] = await Promise.all([
//       this.prisma.retard.count({ where }),
//       this.prisma.retard.findMany({
//         where,
//         include: {
//           user: { select: { id: true, firstName: true, lastName: true, email: true } },
//         },
//         orderBy: [
//           { annee:     'desc' },
//           { mois:      'desc' },
//           { createdAt: 'desc' },
//         ],
//         skip,
//         take: limit,
//       }),
//     ]);

//     return {
//       data,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages:      Math.ceil(total / limit),
//         hasNextPage:     page * limit < total,
//         hasPreviousPage: page > 1,
//       },
//     };
//   }

//   // ─── FIND ONE ─────────────────────────────────────────────────────────────
//   async findOne(dto: FindOneRetardDto) {
//     const { userId, mois, annee } = dto;

//     const retard = await this.prisma.retard.findUnique({
//       where:   { userId_mois_annee: { userId, mois, annee } },
//       include: {
//         user: { select: { id: true, firstName: true, lastName: true, email: true } },
//       },
//     });

//     if (!retard) {
//       throw new NotFoundException(
//         `Aucun retard pour cet employé en ${String(mois).padStart(2, '0')}/${annee}.`,
//       );
//     }

//     return retard;
//   }
// }