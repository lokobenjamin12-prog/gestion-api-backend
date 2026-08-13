"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const pdf_generator_service_1 = require("../../../admin/pdf-generator/services/pdf-generator.service");
const excel_generator_service_1 = require("../../../admin/excel-generator/services/excel-generator.service");
const entreprise_service_1 = require("../../../commerce/entreprise/services/entreprise.service");
const rh_log_service_1 = require("../../log/rh-log.service");
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
let RapportService = class RapportService {
    prisma;
    pdfGen;
    excelGen;
    entrepriseService;
    rhLog;
    realtimeGateway;
    OUTPUT_DIR = path.join(process.cwd(), 'storage', 'rapports');
    constructor(prisma, pdfGen, excelGen, entrepriseService, rhLog, realtimeGateway) {
        this.prisma = prisma;
        this.pdfGen = pdfGen;
        this.excelGen = excelGen;
        this.entrepriseService = entrepriseService;
        this.rhLog = rhLog;
        this.realtimeGateway = realtimeGateway;
        if (!fs.existsSync(this.OUTPUT_DIR)) {
            fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });
        }
    }
    MIME_TYPES = {
        [client_1.ExportFormat.PDF]: 'application/pdf',
        [client_1.ExportFormat.EXCEL]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        [client_1.ExportFormat.CSV]: 'text/csv',
    };
    DEFAULT_MIME_TYPE = 'application/octet-stream';
    async generer(dto, actorId) {
        if (!actorId) {
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        }
        if (dto.formatExport === client_1.ExportFormat.CSV) {
            throw new common_1.BadRequestException("Le format CSV n'est pas encore supporté — utilisez PDF ou EXCEL");
        }
        const [data, actorName, entreprise] = await Promise.all([
            this.collectData(dto),
            this.rhLog.resolveActorName(actorId),
            this.entrepriseService.findFirst(),
        ]);
        const periode = dto.mois && dto.annee
            ? `${String(dto.mois).padStart(2, '0')}/${dto.annee}`
            : `${dto.annee ?? 'global'}`;
        const avertissement = data && typeof data === 'object' && 'avertissement' in data
            ? data.avertissement ?? null
            : null;
        const fichier = await this.genererFichier(dto, data, periode, entreprise);
        const result = await this.prisma.$transaction(async (tx) => {
            const rapport = await tx.rapport.create({
                data: {
                    userId: dto.userId ?? null,
                    type: dto.type,
                    periode,
                    mois: dto.mois ?? null,
                    annee: dto.annee ?? null,
                    formatExport: dto.formatExport,
                    fichier,
                },
            });
            await this.rhLog.info({
                actorId,
                actorName,
                module: client_1.RhModule.RAPPORT,
                action: 'GENERER_RAPPORT',
                entityId: rapport.id,
                entityName: `Rapport ${dto.type} — ${periode}`,
                apres: {
                    type: dto.type, periode, formatExport: dto.formatExport,
                    userId: dto.userId ?? 'global', fichier, avertissement: avertissement ?? 'aucun'
                },
                message: `Rapport ${dto.type} généré (${dto.formatExport}) pour ${periode}${avertissement ? ' — ⚠️ données partielles' : ''}`,
            }, tx);
            return { rapport, fichier, avertissement };
        });
        this.realtimeGateway.emitEntityChanged({ module: 'rapport', action: 'created', id: result.rapport.id });
        return result;
    }
    async getStream(id) {
        if (!id) {
            throw new common_1.BadRequestException("L'identifiant du rapport n'est pas fourni");
        }
        const rapport = await this.findOne(id);
        if (!rapport?.fichier) {
            throw new common_1.BadRequestException('Aucun fichier disponible pour ce rapport');
        }
        try {
            await fs_1.promises.access(rapport.fichier, fs.constants.R_OK);
        }
        catch {
            throw new common_1.NotFoundException("Le fichier n'existe plus ou n'est pas lisible sur le serveur");
        }
        return {
            stream: fs.createReadStream(rapport.fichier),
            filename: path.basename(rapport.fichier),
            mimeType: this.MIME_TYPES[rapport.formatExport] ?? this.DEFAULT_MIME_TYPE,
        };
    }
    async findAll(filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 50;
        const skip = (page - 1) * limit;
        const where = {};
        if (!filters?.includeArchived) {
            where.estArchive = false;
        }
        if (filters?.type)
            where.type = filters.type;
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.mois)
            where.mois = filters.mois;
        if (filters?.annee)
            where.annee = filters.annee;
        const [data, total] = await Promise.all([
            this.prisma.rapport.findMany({
                where,
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
                orderBy: { dateGeneration: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.rapport.count({ where }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                pagesTotales: Math.ceil(total / limit) || 1,
            },
        };
    }
    async findOne(id) {
        if (!id) {
            throw new common_1.BadRequestException("L'identifiant du rapport est requis");
        }
        const rapport = await this.prisma.rapport.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        if (!rapport) {
            throw new common_1.NotFoundException(`Rapport #${id} introuvable`);
        }
        return rapport;
    }
    async softDelete(id, actorId) {
        if (!id)
            throw new common_1.BadRequestException("L'identifiant du rapport est requis");
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const [rapport, actorName] = await Promise.all([
            this.findOne(id),
            this.rhLog.resolveActorName(actorId),
        ]);
        if (rapport.estArchive) {
            throw new common_1.ConflictException("Ce rapport est déjà archivé ou supprimé");
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.rapport.update({
                where: { id },
                data: {
                    estArchive: true,
                    deletedAt: new Date(),
                    fichier: null
                },
            });
            await this.rhLog.warn({
                actorId,
                actorName,
                module: client_1.RhModule.RAPPORT,
                action: 'DELETE_RAPPORT',
                entityId: id,
                entityName: `Rapport ${rapport.type} — ${rapport.periode}`,
                avant: { type: rapport.type, periode: rapport.periode, formatExport: rapport.formatExport, fichier: rapport.fichier },
                message: `Rapport #${id} archivé — ${rapport.type} — ${rapport.periode}`,
            }, tx);
        });
        this.realtimeGateway.emitEntityChanged({ module: 'rapport', action: 'deleted', id });
        if (rapport.fichier) {
            try {
                await fs_1.promises.unlink(rapport.fichier);
            }
            catch {
            }
        }
        return { message: 'Le rapport a été supprimé avec succès' };
    }
    async restore(id, actorId) {
        if (!id)
            throw new common_1.BadRequestException("L'identifiant du rapport est requis");
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const [rapport, actorName] = await Promise.all([
            this.prisma.rapport.findUnique({ where: { id } }),
            this.rhLog.resolveActorName(actorId),
        ]);
        if (!rapport)
            throw new common_1.NotFoundException(`Rapport #${id} introuvable`);
        if (!rapport.estArchive) {
            throw new common_1.BadRequestException("Ce rapport est déjà actif et n'est pas archivé");
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.rapport.update({
                where: { id },
                data: {
                    estArchive: false,
                    deletedAt: null
                },
            });
            await this.rhLog.info({
                actorId,
                actorName,
                module: client_1.RhModule.RAPPORT,
                action: 'RESTORE_RAPPORT',
                entityId: id,
                entityName: `Rapport ${rapport.type} — ${rapport.periode}`,
                apres: { type: rapport.type, periode: rapport.periode, formatExport: rapport.formatExport },
                message: `Rapport #${id} restauré — ${rapport.type} — ${rapport.periode}`,
            }, tx);
        });
        this.realtimeGateway.emitEntityChanged({ module: 'rapport', action: 'restored', id });
        return { message: 'Le rapport a été restauré avec succès' };
    }
    async verifierAvertissementMasseSalariale(mois, annee, userId) {
        const whereBase = {
            mois,
            annee,
            ...(userId ? { userId } : {}),
        };
        const [total, clotures] = await Promise.all([
            this.prisma.salaire.count({ where: whereBase }),
            this.prisma.salaire.count({ where: { ...whereBase, estCloture: true } }),
        ]);
        if (total === 0)
            return `Aucun salaire initialisé pour ${String(mois).padStart(2, '0')}/${annee}`;
        if (clotures < total) {
            return `Données partielles : ${clotures}/${total} salaire(s) clôturé(s) pour ${String(mois).padStart(2, '0')}/${annee}`;
        }
        return null;
    }
    async verifierCloturePourAvertissement(mois, annee, userId) {
        if (!mois || !annee)
            return null;
        const [usersActifs, salairesClotures] = await Promise.all([
            this.prisma.user.count({
                where: { estArchive: false, ...(userId ? { id: userId } : {}) },
            }),
            this.prisma.salaire.count({
                where: { mois, annee, estCloture: true, ...(userId ? { userId } : {}) },
            }),
        ]);
        const periode = `${String(mois).padStart(2, '0')}/${annee}`;
        if (salairesClotures === 0) {
            return `⚠️ Le mois ${periode} n'est pas encore clôturé — les données sont partielles`;
        }
        if (salairesClotures < usersActifs) {
            return (`⚠️ Clôture partielle pour ${periode} — ` +
                `${usersActifs - salairesClotures} employé(s) sur ${usersActifs} sans salaire clôturé`);
        }
        return null;
    }
    async collectData(dto) {
        const moisAnneeFilter = {
            ...(dto.mois ? { mois: dto.mois } : {}),
            ...(dto.annee ? { annee: dto.annee } : {}),
        };
        const userSelect = {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
        };
        switch (dto.type) {
            case client_1.RapportType.ABSENCES: {
                const moisAnneeFilter = {
                    ...(dto.mois ? { mois: dto.mois } : {}),
                    ...(dto.annee ? { annee: dto.annee } : {}),
                };
                const userSelect = {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                };
                const [avertissement, absences, retards, salaires] = await Promise.all([
                    this.verifierCloturePourAvertissement(dto.mois, dto.annee, dto.userId),
                    this.prisma.absence.findMany({
                        where: { ...moisAnneeFilter, ...(dto.userId ? { userId: dto.userId } : {}) },
                        include: userSelect,
                        orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
                    }),
                    this.prisma.retard.findMany({
                        where: { ...moisAnneeFilter, ...(dto.userId ? { userId: dto.userId } : {}) },
                        include: userSelect,
                        orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
                    }),
                    this.prisma.salaire.findMany({
                        where: {
                            estCloture: true,
                            ...moisAnneeFilter,
                            ...(dto.userId ? { userId: dto.userId } : {}),
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phoneNumber: true,
                                    adresse: true,
                                    dateRecrutement: true,
                                    role: { select: { post: true } },
                                },
                            },
                        },
                    }),
                ]);
                const absenceLignes = absences
                    .flatMap(a => a.jours.map(jour => ({
                    employe: `${a.user.firstName} ${a.user.lastName}`,
                    email: a.user.email,
                    mois: a.mois,
                    annee: a.annee,
                    date: jour.date,
                    estJustifie: jour.estJustifie,
                    statut: jour.estJustifie ? 'Justifiée' : 'Injustifiée',
                })))
                    .sort((a, b) => a.date.localeCompare(b.date));
                const retardLignes = retards
                    .flatMap(r => r.jours.map(jour => ({
                    employe: `${r.user.firstName} ${r.user.lastName}`,
                    email: r.user.email,
                    mois: r.mois,
                    annee: r.annee,
                    date: jour.date,
                    estJustifie: jour.estJustifie,
                    heureArrivee: jour.heureArrivee,
                    statut: jour.estJustifie ? 'Justifié' : 'Injustifié (journée annulée)',
                })))
                    .sort((a, b) => a.date.localeCompare(b.date));
                return { absenceLignes, retardLignes, salaires, avertissement };
            }
            case client_1.RapportType.MASSE_SALARIALE: {
                const avertissement = (dto.mois && dto.annee)
                    ? await this.verifierAvertissementMasseSalariale(dto.mois, dto.annee, dto.userId)
                    : null;
                const salaires = await this.prisma.salaire.findMany({
                    where: {
                        estCloture: true,
                        ...moisAnneeFilter,
                        ...(dto.userId ? { userId: dto.userId } : {}),
                    },
                    include: {
                        ...userSelect,
                        absence: { select: { jours: true } },
                        retard: { select: { jours: true } },
                        ficheDePaie: {
                            select: { id: true, jourDePaie: true, dateGeneration: true },
                        },
                    },
                    orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
                });
                let totalBrut = 0, totalDeductions = 0, totalPrimes = 0, totalNet = 0, totalVerse = 0;
                for (const s of salaires) {
                    totalBrut += Number(s.salaireBrut ?? 0);
                    totalDeductions += Number(s.totalDeductions ?? 0);
                    totalPrimes += Number(s.totalPrimes ?? 0);
                    totalNet += Number(s.salaireNet ?? 0);
                    totalVerse += Number(s.montantVerse ?? 0);
                }
                return {
                    agregats: {
                        nbEmployes: salaires.length,
                        totalBrut,
                        totalDeductions,
                        totalPrimes,
                        totalNet,
                        totalVerse,
                    },
                    salaires,
                    avertissement,
                };
            }
            case client_1.RapportType.CONTRATS_CDD: {
                const dateLimite = new Date();
                dateLimite.setDate(dateLimite.getDate() + 90);
                return this.prisma.contrat.findMany({
                    where: {
                        type: 'CDD',
                        dateFin: { lte: dateLimite, gte: new Date() },
                        ...(dto.userId ? { userId: dto.userId } : {}),
                    },
                    include: { ...userSelect, alertes: true },
                    orderBy: { dateFin: 'asc' },
                });
            }
            default:
                return [];
        }
    }
    async genererFichier(dto, data, periode, entreprise) {
        const isPdf = dto.formatExport === client_1.ExportFormat.PDF;
        const isExcel = dto.formatExport === client_1.ExportFormat.EXCEL;
        switch (dto.type) {
            case client_1.RapportType.ABSENCES: {
                const { absenceLignes, retardLignes, salaires, avertissement } = data;
                if (isPdf) {
                    return this.pdfGen.genererRapportAbsencesEtRetards(absenceLignes, retardLignes, periode, this.OUTPUT_DIR, avertissement, entreprise, salaires);
                }
                if (isExcel) {
                    return this.excelGen.genererRapportAbsencesEtRetards(absenceLignes, retardLignes, periode, this.OUTPUT_DIR, avertissement, entreprise, salaires);
                }
                break;
            }
            case client_1.RapportType.MASSE_SALARIALE: {
                if (isPdf)
                    return this.pdfGen.genererRapportMasseSalariale(data, periode, this.OUTPUT_DIR, entreprise);
                if (isExcel)
                    return this.excelGen.genererRapportMasseSalariale(data, periode, this.OUTPUT_DIR, entreprise);
                break;
            }
            case client_1.RapportType.CONTRATS_CDD: {
                if (isPdf)
                    return this.pdfGen.genererRapportContratsCDD(data, periode, this.OUTPUT_DIR, entreprise);
                if (isExcel)
                    return this.excelGen.genererRapportContratsCDD(data, periode, this.OUTPUT_DIR, entreprise);
                break;
            }
        }
        throw new common_1.BadRequestException(`Combinaison type=${dto.type} / format=${dto.formatExport} non supportée`);
    }
};
exports.RapportService = RapportService;
exports.RapportService = RapportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_generator_service_1.PdfGeneratorService,
        excel_generator_service_1.ExcelGeneratorService,
        entreprise_service_1.EntrepriseService,
        rh_log_service_1.RhLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], RapportService);
//# sourceMappingURL=rapport.service.js.map