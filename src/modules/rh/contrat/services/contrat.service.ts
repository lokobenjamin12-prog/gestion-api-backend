// src/contrat/contrat.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ContratType, LogLevel, State, Prisma, RhModule } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContratDto } from '../dto/create-contrat.dto';
import { UpdateContratDto } from '../dto/update-contrat.dto';
import { GetContratsFilterDto } from '../dto/get-contrats-filter.dto';
import { RhLogService } from '../../log/rh-log.service';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';



@Injectable()
export class ContratService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rhLog: RhLogService,
    private readonly realtimeGateway: StockRealtimeGateway,
  ) { }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateContratDto, actorId: string) {
    if (dto.type === ContratType.CDD && !dto.dateFin) {
      throw new BadRequestException('dateFin est obligatoire pour un CDD');
    }
    if (dto.type === ContratType.CDI && dto.dateFin) {
      throw new BadRequestException('Un CDI ne doit pas avoir de dateFin');
    }

    const user = await this.assertUserActif(dto.userId);
    const dateDebut = new Date(dto.dateDebut);
    const dateFin = dto.dateFin ? new Date(dto.dateFin) : null;

    const contrat = await this.prisma.$transaction(async (tx) => {
      const contrat = await tx.contrat.create({
        data: { userId: dto.userId, type: dto.type, dateDebut, dateFin },
        include: this.defaultInclude(),
      });

      await this.rhLog.info({
        actorId,
        actorName: await this.rhLog.resolveActorName(actorId),
        module: RhModule.CONTRAT,
        action: 'CREATE_CONTRAT',
        entityId: contrat.id,
        entityName: `Contrat ${dto.type} — ${user.firstName} ${user.lastName}`,
        apres: { type: dto.type, dateDebut, dateFin },
        message: `Contrat ${dto.type} créé pour ${user.firstName} ${user.lastName}${dateFin ? ` (fin: ${dateFin.toLocaleDateString('fr-FR')})` : ''}`,
      }, tx);

      return contrat;
    });

    this.realtimeGateway.emitEntityChanged({ module: 'contrat', action: 'created', id: contrat.id });
    return contrat;
  }

  // ─── FIND ALL ────────────────────────────────────────────────────────────


  // ─
  // async findAll(filters?: GetContratsFilterDto) {
  //   const page = Math.max(1, filters?.page ?? 1);
  //   const limit = Math.max(1, Math.min(100, filters?.limit ?? 20));
  //   const skip = (page - 1) * limit;

  //   const where: Prisma.ContratWhereInput = { deletedAt: null };
  //   if (filters?.userId) where.userId = filters.userId;
  //   if (filters?.type) where.type = filters.type;

  //   const [total, data] = await this.prisma.$transaction([
  //     this.prisma.contrat.count({ where }),
  //     this.prisma.contrat.findMany({
  //       where,
  //       include: this.defaultInclude(),
  //       orderBy: [{ dateDebut: 'desc' }, { createdAt: 'desc' }],
  //       skip,
  //       take: limit,
  //     }),
  //   ]);

  //   return {
  //     data,
  //     meta: {
  //       total,
  //       page,
  //       limit,
  //       lastPage: Math.ceil(total / limit),
  //       hasNextPage: page * limit < total,
  //       hasPreviousPage: page > 1,
  //     },
  //   };
  // }

  async findAll(filters?: GetContratsFilterDto) {
    const page = Math.max(1, filters?.page ?? 1);
    const limit = Math.max(1, Math.min(100, filters?.limit ?? 20));
    const skip = (page - 1) * limit;

    // Après
    const where: Prisma.ContratWhereInput = filters?.includeArchived ? {} : { deletedAt: null };


    if (filters?.userId) where.userId = filters.userId;
    if (filters?.type) where.type = filters.type;

    if (filters?.dateDebutFrom || filters?.dateDebutTo) {
      where.dateDebut = {};
      if (filters.dateDebutFrom) where.dateDebut.gte = new Date(filters.dateDebutFrom);
      if (filters.dateDebutTo) where.dateDebut.lte = new Date(filters.dateDebutTo);
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.contrat.count({ where }),
      this.prisma.contrat.findMany({
        where,
        include: this.defaultInclude(),
        orderBy: [{ dateDebut: 'desc' }, { createdAt: 'desc' }],
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
        lastPage: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }


  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: string) {
    try {
      const contrat = await this.prisma.contrat.findUniqueOrThrow({
        where: { id },
        include: this.defaultInclude(),
      });
      if (contrat.deletedAt) {
        throw new NotFoundException(`Contrat #${id} introuvable (archivé)`);
      }
      return contrat;
    } catch {
      throw new NotFoundException(`Contrat #${id} introuvable`);
    }
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateContratDto, actorId: string) {
    const contrat = await this.findOne(id);

    if (contrat.type === ContratType.CDI) {
      throw new BadRequestException(
        'Un CDI n\'a pas de date de fin — modification impossible',
      );
    }
    if (!dto.dateFin) {
      throw new BadRequestException('dateFin est requis pour la mise à jour');
    }

    const nouvelleDate = new Date(dto.dateFin);
    if (nouvelleDate <= contrat.dateDebut) {
      throw new BadRequestException(
        `dateFin (${dto.dateFin}) doit être postérieure à dateDebut (${contrat.dateDebut.toISOString().split('T')[0]})`,
      );
    }

    const avant = { dateFin: contrat.dateFin };

    const updated = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.contrat.update({
        where: { id },
        data: { dateFin: nouvelleDate },
        include: this.defaultInclude(),
      });

      await this.rhLog.warn({
        actorId,
        actorName: await this.rhLog.resolveActorName(actorId),
        module: RhModule.CONTRAT,
        action: 'UPDATE_CONTRAT',
        entityId: id,
        entityName: `Contrat #${id} — ${contrat.user.firstName} ${contrat.user.lastName}`,
        avant: { dateFin: contrat.dateFin },
        apres: { dateFin: nouvelleDate },
        message: `Date de fin modifiée — contrat #${id} — ${contrat.user.firstName} ${contrat.user.lastName} : ${avant.dateFin?.toLocaleDateString('fr-FR') ?? '—'} → ${nouvelleDate.toLocaleDateString('fr-FR')}`,
      }, tx);

      return updated;
    });

    this.realtimeGateway.emitEntityChanged({ module: 'contrat', action: 'updated', id });
    return updated;
  }

  // ─── SOFT DELETE ──────────────────────────────────────────────────────────
  async softDelete(id: string, actorId: string) {
    const contrat = await this.findOne(id);

    if (contrat.deletedAt) {
      throw new BadRequestException(`Le contrat #${id} est déjà archivé.`);
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.contrat.update({
        where: { id },
        data: { deletedAt: now },
      });

      await this.rhLog.warn({
        actorId,
        actorName: await this.rhLog.resolveActorName(actorId),
        module: RhModule.CONTRAT,
        action: 'DELETE_CONTRAT',
        entityId: id,
        entityName: `Contrat #${id} — ${contrat.user.firstName} ${contrat.user.lastName}`,
        avant: { deletedAt: null },
        apres: { deletedAt: now },
        message: `Contrat #${id} (${contrat.type}) archivé — ${contrat.user.firstName} ${contrat.user.lastName}`,
      }, tx);

    });

    this.realtimeGateway.emitEntityChanged({ module: 'contrat', action: 'deleted', id });
    return { message: 'Contrat archivé avec succès' };
  }

  // ─── RESTORE ──────────────────────────────────────────────────────────────
  async restore(id: string, actorId: string) {
    if (!id) {
      throw new BadRequestException("L'identifiant du contrat est requis");
    }

    const contrat = await this.prisma.contrat.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!contrat) {
      throw new NotFoundException(`Le contrat #${id} est introuvable`);
    }
    if (!contrat.deletedAt) {
      throw new BadRequestException(`Le contrat #${id} est déjà actif`);
    }

    const [restoredContrat] = await Promise.all([
      this.prisma.contrat.update({
        where: { id },
        data: { deletedAt: null },
        include: this.defaultInclude(),
      }),

      this.rhLog.info({
        actorId,
        actorName: await this.rhLog.resolveActorName(actorId),
        module: RhModule.CONTRAT,
        action: 'RESTORE_CONTRAT',
        entityId: id,
        entityName: `Contrat #${id} — ${contrat.user?.firstName ?? ''} ${contrat.user?.lastName ?? ''}`,
        apres: { deletedAt: null },
        message: `Contrat #${id} restauré — ${contrat.user?.firstName ?? ''} ${contrat.user?.lastName ?? ''}`,
      }),

    ]);

    this.realtimeGateway.emitEntityChanged({ module: 'contrat', action: 'restored', id });
    return restoredContrat;
  }

  // ─── EXPIRATIONS PROCHES ──────────────────────────────────────────────────
  async getExpirationsProches(delaiJours = 30) {
    const maintenant = new Date();
    const dateLimite = new Date(maintenant);
    dateLimite.setDate(dateLimite.getDate() + delaiJours);

    return this.prisma.contrat.findMany({
      where: {
        type: ContratType.CDD,
        deletedAt: null,
        dateFin: { gte: maintenant, lte: dateLimite },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        alertes: true,
      },
      orderBy: { dateFin: 'asc' },
    });
  }

  // ─── CRON : alertes CDD ───────────────────────────────────────────────────
  async traiterAlertesCDD() {
    const DELAIS = [30, 15, 7];
    return Promise.all(DELAIS.map(async (delai) => ({
      delai,
      nb: await this.traiterDelai(delai),
    })));
  }

  private async traiterDelai(delaiJours: number) {
    const maintenant = new Date();

    const debut = new Date(maintenant);
    debut.setDate(debut.getDate() + delaiJours);
    debut.setHours(0, 0, 0, 0);

    const fin = new Date(debut);
    fin.setHours(23, 59, 59, 999);

    const contrats = await this.prisma.contrat.findMany({
      where: {
        type: ContratType.CDD,
        deletedAt: null,
        dateFin: { gte: debut, lte: fin },
        alertes: { none: { delaiJours } },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (contrats.length === 0) return 0;

    await Promise.all(
      contrats.map((contrat) => {
        const dateEcheance = contrat.dateFin
          ? new Date(contrat.dateFin).toLocaleDateString('fr-FR')
          : 'Inconnue';

        return this.prisma.$transaction(async (tx) => {
          await tx.alerteCDD.create({
            data: {
              contratId: contrat.id,
              delaiJours,
              estEnvoyee: true,
              envoyeeAt: maintenant,
            },
          });

          // 💡 FIX 2: Fixed the log payload properties to conform with your application's LogService format
          await this.rhLog.warn({
            actorId: contrat.user.id,
            actorName: `${contrat.user.firstName} ${contrat.user.lastName}`,
            module: RhModule.CONTRAT,
            action: 'ALERTE_CDD',
            entityId: contrat.id,
            entityName: `Contrat CDD — ${contrat.user.firstName} ${contrat.user.lastName}`,
            message: `CDD de ${contrat.user.firstName} ${contrat.user.lastName} expire dans ${delaiJours} jour(s) — ${dateEcheance}`,
          }, tx);

        });
      }),
    );

    return contrats.length;
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  private defaultInclude() {
    return {
      user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
      alertes: true,
    };
  }

  private async assertUserActif(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur #${userId} introuvable`);
    }

    if (user.estArchive) {
      throw new BadRequestException('Action impossible : l’utilisateur est archivé');
    }

    return user;
  }
}

