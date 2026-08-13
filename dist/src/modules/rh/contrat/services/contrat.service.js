"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContratService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const rh_log_service_1 = require("../../log/rh-log.service");
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
let ContratService = class ContratService {
    prisma;
    rhLog;
    realtimeGateway;
    constructor(prisma, rhLog, realtimeGateway) {
        this.prisma = prisma;
        this.rhLog = rhLog;
        this.realtimeGateway = realtimeGateway;
    }
    async create(dto, actorId) {
        if (dto.type === client_1.ContratType.CDD && !dto.dateFin) {
            throw new common_1.BadRequestException('dateFin est obligatoire pour un CDD');
        }
        if (dto.type === client_1.ContratType.CDI && dto.dateFin) {
            throw new common_1.BadRequestException('Un CDI ne doit pas avoir de dateFin');
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
                module: client_1.RhModule.CONTRAT,
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
    async findAll(filters) {
        const page = Math.max(1, filters?.page ?? 1);
        const limit = Math.max(1, Math.min(100, filters?.limit ?? 20));
        const skip = (page - 1) * limit;
        const where = filters?.includeArchived ? {} : { deletedAt: null };
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.type)
            where.type = filters.type;
        if (filters?.dateDebutFrom || filters?.dateDebutTo) {
            where.dateDebut = {};
            if (filters.dateDebutFrom)
                where.dateDebut.gte = new Date(filters.dateDebutFrom);
            if (filters.dateDebutTo)
                where.dateDebut.lte = new Date(filters.dateDebutTo);
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
    async findOne(id) {
        try {
            const contrat = await this.prisma.contrat.findUniqueOrThrow({
                where: { id },
                include: this.defaultInclude(),
            });
            if (contrat.deletedAt) {
                throw new common_1.NotFoundException(`Contrat #${id} introuvable (archivé)`);
            }
            return contrat;
        }
        catch {
            throw new common_1.NotFoundException(`Contrat #${id} introuvable`);
        }
    }
    async update(id, dto, actorId) {
        const contrat = await this.findOne(id);
        if (contrat.type === client_1.ContratType.CDI) {
            throw new common_1.BadRequestException('Un CDI n\'a pas de date de fin — modification impossible');
        }
        if (!dto.dateFin) {
            throw new common_1.BadRequestException('dateFin est requis pour la mise à jour');
        }
        const nouvelleDate = new Date(dto.dateFin);
        if (nouvelleDate <= contrat.dateDebut) {
            throw new common_1.BadRequestException(`dateFin (${dto.dateFin}) doit être postérieure à dateDebut (${contrat.dateDebut.toISOString().split('T')[0]})`);
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
                module: client_1.RhModule.CONTRAT,
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
    async softDelete(id, actorId) {
        const contrat = await this.findOne(id);
        if (contrat.deletedAt) {
            throw new common_1.BadRequestException(`Le contrat #${id} est déjà archivé.`);
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
                module: client_1.RhModule.CONTRAT,
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
    async restore(id, actorId) {
        if (!id) {
            throw new common_1.BadRequestException("L'identifiant du contrat est requis");
        }
        const contrat = await this.prisma.contrat.findUnique({
            where: { id },
            include: { user: { select: { firstName: true, lastName: true } } },
        });
        if (!contrat) {
            throw new common_1.NotFoundException(`Le contrat #${id} est introuvable`);
        }
        if (!contrat.deletedAt) {
            throw new common_1.BadRequestException(`Le contrat #${id} est déjà actif`);
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
                module: client_1.RhModule.CONTRAT,
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
    async getExpirationsProches(delaiJours = 30) {
        const maintenant = new Date();
        const dateLimite = new Date(maintenant);
        dateLimite.setDate(dateLimite.getDate() + delaiJours);
        return this.prisma.contrat.findMany({
            where: {
                type: client_1.ContratType.CDD,
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
    async traiterAlertesCDD() {
        const DELAIS = [30, 15, 7];
        return Promise.all(DELAIS.map(async (delai) => ({
            delai,
            nb: await this.traiterDelai(delai),
        })));
    }
    async traiterDelai(delaiJours) {
        const maintenant = new Date();
        const debut = new Date(maintenant);
        debut.setDate(debut.getDate() + delaiJours);
        debut.setHours(0, 0, 0, 0);
        const fin = new Date(debut);
        fin.setHours(23, 59, 59, 999);
        const contrats = await this.prisma.contrat.findMany({
            where: {
                type: client_1.ContratType.CDD,
                deletedAt: null,
                dateFin: { gte: debut, lte: fin },
                alertes: { none: { delaiJours } },
            },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
        if (contrats.length === 0)
            return 0;
        await Promise.all(contrats.map((contrat) => {
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
                await this.rhLog.warn({
                    actorId: contrat.user.id,
                    actorName: `${contrat.user.firstName} ${contrat.user.lastName}`,
                    module: client_1.RhModule.CONTRAT,
                    action: 'ALERTE_CDD',
                    entityId: contrat.id,
                    entityName: `Contrat CDD — ${contrat.user.firstName} ${contrat.user.lastName}`,
                    message: `CDD de ${contrat.user.firstName} ${contrat.user.lastName} expire dans ${delaiJours} jour(s) — ${dateEcheance}`,
                }, tx);
            });
        }));
        return contrats.length;
    }
    defaultInclude() {
        return {
            user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
            alertes: true,
        };
    }
    async assertUserActif(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur #${userId} introuvable`);
        }
        if (user.estArchive) {
            throw new common_1.BadRequestException('Action impossible : l’utilisateur est archivé');
        }
        return user;
    }
};
exports.ContratService = ContratService;
exports.ContratService = ContratService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rh_log_service_1.RhLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], ContratService);
//# sourceMappingURL=contrat.service.js.map