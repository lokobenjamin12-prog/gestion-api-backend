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
exports.RetardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const jours_ouvrables_util_1 = require("../../salaire/jours-ouvrables.util");
const rh_log_service_1 = require("../../log/rh-log.service");
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
let RetardService = class RetardService {
    prisma;
    rhLog;
    realtimeGateway;
    constructor(prisma, rhLog, realtimeGateway) {
        this.prisma = prisma;
        this.rhLog = rhLog;
        this.realtimeGateway = realtimeGateway;
    }
    async assertSalaireOuvert(userId, mois, annee) {
        const salaire = await this.prisma.salaire.findUnique({
            where: { userId_mois_annee: { userId, mois, annee } },
            select: { estCloture: true },
        });
        if (!salaire) {
            const codeMois = String(mois).padStart(2, '0');
            throw new common_1.BadRequestException(`Modification impossible : la période de paie ${codeMois}/${annee} n'est pas encore initialisée.`);
        }
        if (salaire.estCloture) {
            const codeMois = String(mois).padStart(2, '0');
            throw new common_1.BadRequestException(`Modification impossible : le salaire de ${codeMois}/${annee} est déjà clôturé.`);
        }
    }
    async assertPasDeConflitAbsence(userId, mois, annee, dates) {
        const absence = await this.prisma.absence.findUnique({
            where: { userId_mois_annee: { userId, mois, annee } },
            select: { jours: true },
        });
        if (!absence)
            return;
        const joursAbsence = absence.jours;
        const absenceDates = new Set();
        for (let i = 0; i < joursAbsence.length; i++)
            absenceDates.add(joursAbsence[i].date);
        const conflits = [];
        for (let i = 0; i < dates.length; i++) {
            if (absenceDates.has(dates[i]))
                conflits.push(dates[i]);
        }
        if (conflits.length > 0) {
            throw new common_1.ConflictException(`Une absence existe déjà pour les dates suivantes : ${conflits.join(', ')}. ` +
                `Un employé ne peut pas être en retard et absent le même jour.`);
        }
    }
    async ajouterJours(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const datesInvalides = [];
        for (let i = 0; i < dto.jours.length; i++) {
            const d = dto.jours[i].date;
            if (!(0, jours_ouvrables_util_1.isDateInMonth)(d, dto.mois, dto.annee))
                datesInvalides.push(d);
        }
        if (datesInvalides.length > 0) {
            throw new common_1.BadRequestException(`Dates hors période ${dto.mois}/${dto.annee} : ${datesInvalides.join(', ')}`);
        }
        const userr = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            select: { firstName: true, lastName: true },
        });
        if (!userr)
            throw new common_1.NotFoundException(`L'employé avec l'ID #${dto.userId} est introuvable.`);
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
        if (!user)
            throw new common_1.NotFoundException(`Employé #${dto.userId} introuvable`);
        const result = await this.prisma.$transaction(async (tx) => {
            let result;
            if (!existing) {
                result = await tx.retard.create({
                    data: { userId: dto.userId, mois: dto.mois, annee: dto.annee, jours: dto.jours },
                    include: { user: { select: { id: true, firstName: true, lastName: true } } },
                });
            }
            else {
                const existingJours = existing.jours;
                const existingDates = new Set();
                for (let i = 0; i < existingJours.length; i++)
                    existingDates.add(existingJours[i].date);
                const nouveauxJours = dto.jours.filter(j => !existingDates.has(j.date));
                if (nouveauxJours.length === 0) {
                    throw new common_1.ConflictException('Toutes les dates fournies sont déjà enregistrées dans les retards du mois.');
                }
                const mergedJours = [...existingJours, ...nouveauxJours].sort((a, b) => a.date.localeCompare(b.date));
                result = await tx.retard.update({
                    where: { id: existing.id },
                    data: { jours: mergedJours },
                    include: { user: { select: { id: true, firstName: true, lastName: true } } },
                });
            }
            const nomEmploye = `${user.firstName} ${user.lastName}`;
            const codeMois = String(dto.mois).padStart(2, '0');
            await this.rhLog.info({
                actorId,
                actorName,
                module: client_1.RhModule.RETARD,
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
    async mettreAJourJour(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const { mois, annee } = (0, jours_ouvrables_util_1.extractMoisAnnee)(dto.date);
        const [retard, actorName] = await Promise.all([
            this.prisma.retard.findUnique({
                where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
            }),
            this.rhLog.resolveActorName(actorId),
            this.assertSalaireOuvert(dto.userId, mois, annee),
        ]);
        if (!retard) {
            const codeMois = String(mois).padStart(2, '0');
            throw new common_1.NotFoundException(`Aucun retard enregistré pour ${codeMois}/${annee}.`);
        }
        const jours = retard.jours;
        const idx = jours.findIndex(j => j.date === dto.date);
        if (idx === -1)
            throw new common_1.NotFoundException(`Aucun retard enregistré pour le ${dto.date}.`);
        const avant = { ...jours[idx] };
        jours[idx] = { date: dto.date, estJustifie: dto.estJustifie };
        const apres = { ...jours[idx] };
        const result = await this.prisma.$transaction(async (tx) => {
            const result = await tx.retard.update({
                where: { id: retard.id },
                data: { jours: jours },
            });
            const statutAvant = avant.estJustifie ? 'Justifié' : 'Injustifié';
            const statutApres = apres.estJustifie ? 'Justifié' : 'Injustifié';
            await this.rhLog.warn({
                actorId,
                actorName,
                module: client_1.RhModule.RETARD,
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
    async supprimerJour(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const { mois, annee } = (0, jours_ouvrables_util_1.extractMoisAnnee)(dto.date);
        const [retard, actorName] = await Promise.all([
            this.prisma.retard.findUnique({
                where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
            }),
            this.rhLog.resolveActorName(actorId),
            this.assertSalaireOuvert(dto.userId, mois, annee),
        ]);
        if (!retard) {
            const codeMois = String(mois).padStart(2, '0');
            throw new common_1.NotFoundException(`Aucun retard pour ${codeMois}/${annee}.`);
        }
        const jours = retard.jours;
        const jourSupprime = jours.find(j => j.date === dto.date);
        if (!jourSupprime)
            throw new common_1.NotFoundException(`Retard du ${dto.date} introuvable.`);
        const nouveauxJours = jours.filter(j => j.date !== dto.date);
        const result = await this.prisma.$transaction(async (tx) => {
            let result = null;
            if (nouveauxJours.length === 0) {
                await tx.retard.delete({ where: { id: retard.id } });
            }
            else {
                result = await tx.retard.update({
                    where: { id: retard.id },
                    data: { jours: nouveauxJours },
                });
            }
            const statutOriginal = jourSupprime.estJustifie ? 'justifié' : 'injustifié';
            await this.rhLog.warn({
                actorId,
                actorName,
                module: client_1.RhModule.RETARD,
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
    async findAll(dto) {
        const where = {};
        if (dto.userId)
            where.userId = dto.userId;
        if (dto.mois)
            where.mois = dto.mois;
        if (dto.annee)
            where.annee = dto.annee;
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
    async findOne(dto) {
        const { userId, mois, annee } = dto;
        const retard = await this.prisma.retard.findUnique({
            where: { userId_mois_annee: { userId, mois, annee } },
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } } },
        });
        if (!retard) {
            const codeMois = String(mois).padStart(2, '0');
            throw new common_1.NotFoundException(`Aucun retard pour cet employé en ${codeMois}/${annee}.`);
        }
        return retard;
    }
};
exports.RetardService = RetardService;
exports.RetardService = RetardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rh_log_service_1.RhLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], RetardService);
//# sourceMappingURL=retard.service.js.map