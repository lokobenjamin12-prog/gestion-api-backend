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
exports.AbsenceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const jours_ouvrables_util_1 = require("../../salaire/jours-ouvrables.util");
const rh_log_service_1 = require("../../log/rh-log.service");
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
let AbsenceService = class AbsenceService {
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
            const moisFormate = String(mois).padStart(2, '0');
            throw new common_1.NotFoundException(`Le salaire de ${moisFormate}/${annee} n'existe pas pour cet utilisateur.`);
        }
        if (salaire.estCloture) {
            const moisFormate = String(mois).padStart(2, '0');
            throw new common_1.BadRequestException(`Modification impossible : le salaire de ${moisFormate}/${annee} est déjà clôturé.`);
        }
    }
    async assertPasDeConflitRetard(userId, mois, annee, dates) {
        if (!userId)
            throw new common_1.BadRequestException(`L'identifiant admin est requis.`);
        if (dates.length === 0)
            return;
        const retard = await this.prisma.retard.findUnique({
            where: { userId_mois_annee: { userId, mois, annee } },
            select: { jours: true },
        });
        if (!retard?.jours)
            return;
        const joursRetard = retard.jours;
        const retardDates = new Set();
        for (let i = 0; i < joursRetard.length; i++) {
            retardDates.add(joursRetard[i].date);
        }
        const aUnConflit = dates.some(d => retardDates.has(d));
        if (aUnConflit) {
            const conflits = dates.filter(d => retardDates.has(d));
            throw new common_1.ConflictException(`Un retard existe déjà pour les dates suivantes : ${conflits.join(', ')}. ` +
                `Un employé ne peut pas être absent et en retard le même jour.`);
        }
    }
    async ajouterJours(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        if (!dto.jours || dto.jours.length === 0)
            return;
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
        if (!user)
            throw new common_1.NotFoundException(`L'employé avec l'ID #${dto.userId} est introuvable.`);
        const result = await this.prisma.$transaction(async (tx) => {
            let result;
            if (!existing) {
                result = await tx.absence.create({
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
                    throw new common_1.ConflictException('Toutes les dates fournies sont déjà enregistrées.');
                }
                const mergedJours = [...existingJours, ...nouveauxJours].sort((a, b) => a.date.localeCompare(b.date));
                result = await tx.absence.update({
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
                module: client_1.RhModule.ABSENCE,
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
    async mettreAJourJour(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const { mois, annee } = (0, jours_ouvrables_util_1.extractMoisAnnee)(dto.date);
        const [absence, actorName] = await Promise.all([
            this.prisma.absence.findUnique({
                where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
            }),
            this.rhLog.resolveActorName(actorId),
            this.assertSalaireOuvert(dto.userId, mois, annee),
        ]);
        if (!absence) {
            const codeMois = String(mois).padStart(2, '0');
            throw new common_1.NotFoundException(`Aucune absence enregistrée pour ${codeMois}/${annee}.`);
        }
        const jours = absence.jours;
        const idx = jours.findIndex(j => j.date === dto.date);
        if (idx === -1)
            throw new common_1.NotFoundException(`Aucune absence enregistrée pour le ${dto.date}.`);
        const avant = { ...jours[idx] };
        jours[idx] = { date: dto.date, estJustifie: dto.estJustifie };
        const apres = { ...jours[idx] };
        const result = await this.prisma.$transaction(async (tx) => {
            const result = await tx.absence.update({
                where: { id: absence.id },
                data: { jours: jours },
            });
            const codeMois = String(mois).padStart(2, '0');
            const statutAvant = avant.estJustifie ? 'Justifiée' : 'Injustifiée';
            const statutApres = apres.estJustifie ? 'Justifiée' : 'Injustifiée';
            await this.rhLog.warn({
                actorId,
                actorName,
                module: client_1.RhModule.ABSENCE,
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
    async supprimerJour(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const { mois, annee } = (0, jours_ouvrables_util_1.extractMoisAnnee)(dto.date);
        const [absence, actorName] = await Promise.all([
            this.prisma.absence.findUnique({
                where: { userId_mois_annee: { userId: dto.userId, mois, annee } },
            }),
            this.rhLog.resolveActorName(actorId),
            this.assertSalaireOuvert(dto.userId, mois, annee),
        ]);
        if (!absence) {
            const codeMois = String(mois).padStart(2, '0');
            throw new common_1.NotFoundException(`Aucune absence pour ${codeMois}/${annee}.`);
        }
        const jours = absence.jours;
        const jourSupprime = jours.find(j => j.date === dto.date);
        if (!jourSupprime)
            throw new common_1.NotFoundException(`Absence du ${dto.date} introuvable.`);
        const nouveauxJours = jours.filter(j => j.date !== dto.date);
        const result = await this.prisma.$transaction(async (tx) => {
            let result = null;
            if (nouveauxJours.length === 0) {
                await tx.absence.delete({ where: { id: absence.id } });
            }
            else {
                result = await tx.absence.update({
                    where: { id: absence.id },
                    data: { jours: nouveauxJours },
                });
            }
            const statutOriginal = jourSupprime.estJustifie ? 'justifiée' : 'injustifiée';
            await this.rhLog.warn({
                actorId,
                actorName,
                module: client_1.RhModule.ABSENCE,
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
    async findOne(dto) {
        const { userId, mois, annee } = dto;
        const absence = await this.prisma.absence.findUnique({
            where: { userId_mois_annee: { userId, mois, annee } },
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } } },
        });
        if (!absence) {
            const codeMois = String(mois).padStart(2, '0');
            throw new common_1.NotFoundException(`Aucune absence pour cet employé en ${codeMois}/${annee}.`);
        }
        return absence;
    }
};
exports.AbsenceService = AbsenceService;
exports.AbsenceService = AbsenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rh_log_service_1.RhLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], AbsenceService);
//# sourceMappingURL=absence.service.js.map