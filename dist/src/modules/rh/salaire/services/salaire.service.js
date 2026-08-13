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
exports.SalaireService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const pdf_generator_service_1 = require("../../../admin/pdf-generator/services/pdf-generator.service");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const jours_ouvrables_util_1 = require("../jours-ouvrables.util");
const client_1 = require("@prisma/client");
const entreprise_service_1 = require("../../../commerce/entreprise/services/entreprise.service");
const rh_log_service_1 = require("../../log/rh-log.service");
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
let SalaireService = class SalaireService {
    prisma;
    entrepriseService;
    pdfGen;
    rhLog;
    realtimeGateway;
    constructor(prisma, entrepriseService, pdfGen, rhLog, realtimeGateway) {
        this.prisma = prisma;
        this.entrepriseService = entrepriseService;
        this.pdfGen = pdfGen;
        this.rhLog = rhLog;
        this.realtimeGateway = realtimeGateway;
    }
    async initialiser(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const [user, existant, actorName] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: dto.userId },
                select: { id: true, firstName: true, lastName: true, salaireBase: true, active: true, profilePicture: true },
            }),
            this.prisma.salaire.findUnique({
                where: { userId_mois_annee: { userId: dto.userId, mois: dto.mois, annee: dto.annee } },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);
        if (!user) {
            throw new common_1.NotFoundException(`Employé #${dto.userId} introuvable`);
        }
        if (!user.active) {
            throw new common_1.BadRequestException(`L'employé ${user.firstName} ${user.lastName} est inactif`);
        }
        if (existant) {
            const codeMois = String(dto.mois).padStart(2, '0');
            throw new common_1.ConflictException(`Un salaire existe déjà pour ${user.firstName} ${user.lastName} — ${codeMois}/${dto.annee}`);
        }
        const nbJoursOuvrables = (0, jours_ouvrables_util_1.getJoursOuvrables)(dto.mois, dto.annee);
        const salaireBrut = (0, jours_ouvrables_util_1.round2)(Number(user.salaireBase));
        const prixJournalier = (0, jours_ouvrables_util_1.round2)(salaireBrut / nbJoursOuvrables);
        const salaireCree = await this.prisma.$transaction(async (tx) => {
            const salaire = await tx.salaire.create({
                data: {
                    userId: dto.userId,
                    mois: dto.mois,
                    annee: dto.annee,
                    nbJoursOuvrables,
                    prixJournalier,
                    salaireBrut,
                    salaireNet: salaireBrut,
                    primes: [],
                },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
                },
            });
            const nomEmploye = `${user.firstName} ${user.lastName}`;
            const codeMois = String(dto.mois).padStart(2, '0');
            await this.rhLog.info({
                actorId, actorName,
                module: client_1.RhModule.SALAIRE,
                action: 'INITIALISER_SALAIRE',
                entityId: salaire.id,
                entityName: `Salaire ${codeMois}/${dto.annee} — ${nomEmploye}`,
                apres: { salaireBrut, nbJoursOuvrables, prixJournalier },
                message: `Salaire initialisé pour ${nomEmploye} — ${codeMois}/${dto.annee} ...`,
            }, tx);
            return salaire;
        });
        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'created', id: salaireCree.id });
        return salaireCree;
    }
    async ajouterPrime(salaireId, dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const [salaire, actorName] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                select: { estCloture: true, primes: true, salaireBrut: true, totalDeductions: true },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);
        if (!salaire)
            throw new common_1.NotFoundException(`Salaire #${salaireId} introuvable`);
        if (salaire.estCloture) {
            throw new common_1.BadRequestException("Impossible d'ajouter une prime : le salaire est clôturé");
        }
        const existingPrimes = salaire.primes;
        let cumulPrimes = dto.somme;
        for (let i = 0; i < existingPrimes.length; i++) {
            cumulPrimes += existingPrimes[i].somme;
        }
        const totalPrimes = (0, jours_ouvrables_util_1.round2)(cumulPrimes);
        const nouvellesPrimes = [...existingPrimes, { somme: dto.somme, raison: dto.raison }];
        const salaireNet = (0, jours_ouvrables_util_1.round2)(Math.max(0, Number(salaire.salaireBrut) - Number(salaire.totalDeductions) + totalPrimes));
        const updated = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.salaire.update({
                where: { id: salaireId },
                data: {
                    primes: nouvellesPrimes,
                    totalPrimes,
                    salaireNet
                },
            });
            await this.rhLog.info({
                actorId, actorName,
                module: client_1.RhModule.SALAIRE,
                action: 'AJOUTER_PRIME',
                entityId: salaireId,
                entityName: `Salaire #${salaireId}`,
                apres: { somme: dto.somme, raison: dto.raison },
                message: `Prime ajoutée : "${dto.raison}" — ${dto.somme.toLocaleString('fr-FR')} FCFA`,
            }, tx);
            return updated;
        });
        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return updated;
    }
    async supprimerPrime(salaireId, dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const [salaire, actorName] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                select: { estCloture: true, primes: true, totalPrimes: true, salaireBrut: true, totalDeductions: true },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);
        if (!salaire)
            throw new common_1.NotFoundException(`Salaire #${salaireId} introuvable`);
        if (salaire.estCloture) {
            throw new common_1.BadRequestException("Impossible de supprimer une prime : le salaire est clôturé");
        }
        const primes = salaire.primes;
        if (dto.index < 0 || dto.index >= primes.length) {
            throw new common_1.BadRequestException(`Index de prime invalide : ${dto.index}`);
        }
        const primeSupprimee = primes[dto.index];
        const totalPrimes = (0, jours_ouvrables_util_1.round2)(Math.max(0, Number(salaire.totalPrimes ?? 0) - primeSupprimee.somme));
        const nouvellesPrimes = [...primes];
        nouvellesPrimes.splice(dto.index, 1);
        const salaireNet = (0, jours_ouvrables_util_1.round2)(Math.max(0, Number(salaire.salaireBrut) - Number(salaire.totalDeductions) + totalPrimes));
        const updated = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.salaire.update({
                where: { id: salaireId },
                data: {
                    primes: nouvellesPrimes,
                    totalPrimes,
                    salaireNet
                },
            });
            await this.rhLog.warn({
                actorId, actorName,
                module: client_1.RhModule.SALAIRE,
                action: 'SUPPRIMER_PRIME',
                entityId: salaireId,
                entityName: `Salaire #${salaireId}`,
                avant: primeSupprimee,
                message: `Prime supprimée : "${primeSupprimee.raison}" — ${primeSupprimee.somme.toLocaleString('fr-FR')} FCFA`,
            }, tx);
            return updated;
        });
        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return updated;
    }
    async cloturerMois(salaireId, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const [salaire, actorName] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
                    absence: true,
                    retard: true,
                },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);
        if (!salaire)
            throw new common_1.NotFoundException(`Salaire #${salaireId} introuvable`);
        if (salaire.estCloture) {
            throw new common_1.ConflictException('Ce salaire est déjà clôturé');
        }
        let absence = salaire.absence;
        let retard = salaire.retard;
        if (!absence || !retard) {
            const [absenceFetch, retardFetch] = await Promise.all([
                !absence ? this.prisma.absence.findUnique({
                    where: { userId_mois_annee: { userId: salaire.userId, mois: salaire.mois, annee: salaire.annee } },
                }) : null,
                !retard ? this.prisma.retard.findUnique({
                    where: { userId_mois_annee: { userId: salaire.userId, mois: salaire.mois, annee: salaire.annee } },
                }) : null,
            ]);
            if (absenceFetch)
                absence = absenceFetch;
            if (retardFetch)
                retard = retardFetch;
        }
        const joursAbsence = absence?.jours;
        const joursRetard = retard?.jours;
        const primes = salaire.primes;
        const calcul = (0, jours_ouvrables_util_1.calculerPaie)({
            salaireBrut: Number(salaire.salaireBrut),
            prixJournalier: Number(salaire.prixJournalier),
            joursAbsence: joursAbsence ?? [],
            joursRetard: joursRetard ?? [],
            primes: primes ?? [],
        });
        const updatedSalaire = await this.prisma.$transaction(async (tx) => {
            const nomEmploye = `${salaire.user.firstName} ${salaire.user.lastName}`;
            const codeMois = String(salaire.mois).padStart(2, '0');
            const updated = await tx.salaire.update({
                where: { id: salaireId },
                data: {
                    nbAbsJust: calcul.nbAbsJust,
                    nbAbsInjust: calcul.nbAbsInjust,
                    deductionAbs: calcul.deductionAbs,
                    nbRetardsJust: calcul.nbRetardsJust,
                    nbRetardsInjust: calcul.nbRetardsInjust,
                    deductionRetards: calcul.deductionRetards,
                    totalDeductions: calcul.totalDeductions,
                    totalPrimes: calcul.totalPrimes,
                    salaireNet: calcul.salaireNet,
                    estCloture: true,
                    dateCloture: new Date(),
                },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
                    absence: true,
                    retard: true,
                },
            });
            const updatePromises = [];
            if (absence && !absence.salaireId) {
                updatePromises.push(tx.absence.update({ where: { id: absence.id }, data: { salaireId } }));
            }
            if (retard && !retard.salaireId) {
                updatePromises.push(tx.retard.update({ where: { id: retard.id }, data: { salaireId } }));
            }
            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
            }
            await this.rhLog.warn({
                actorId, actorName,
                module: client_1.RhModule.SALAIRE,
                action: 'CLOTURER_SALAIRE',
                entityId: salaireId,
                entityName: `Salaire ${codeMois}/${salaire.annee} — ${nomEmploye}`,
                apres: {
                    nbAbsJust: calcul.nbAbsJust, nbAbsInjust: calcul.nbAbsInjust,
                    nbRetardsJust: calcul.nbRetardsJust, nbRetardsInjust: calcul.nbRetardsInjust,
                    totalDeductions: calcul.totalDeductions, totalPrimes: calcul.totalPrimes,
                    salaireNet: calcul.salaireNet
                },
                message: `Salaire clôturé — ${nomEmploye} — ${codeMois}/${salaire.annee} — Net : ${calcul.salaireNet.toLocaleString('fr-FR')} FCFA`,
            }, tx);
            return updated;
        });
        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return updatedSalaire;
    }
    async enregistrerVersement(salaireId, dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const [salaire, actorName] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                include: { user: { select: { id: true, firstName: true, lastName: true, profilePicture: true } } },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);
        if (!salaire)
            throw new common_1.NotFoundException(`Salaire #${salaireId} introuvable`);
        if (!salaire.estCloture) {
            throw new common_1.BadRequestException("Le salaire doit être clôturé avant d'enregistrer un versement");
        }
        if (salaire.montantVerse !== null) {
            throw new common_1.ConflictException('Un versement a déjà été enregistré pour ce salaire');
        }
        const salaireNet = (0, jours_ouvrables_util_1.round2)(Number(salaire.salaireNet));
        if ((0, jours_ouvrables_util_1.round2)(dto.montantVerse) !== salaireNet) {
            throw new common_1.BadRequestException(`Le montant versé (${dto.montantVerse.toLocaleString('fr-FR')} FCFA) ` +
                `ne correspond pas au salaire net calculé ` +
                `(${salaireNet.toLocaleString('fr-FR')} FCFA). ` +
                `Veuillez saisir exactement ${salaireNet.toLocaleString('fr-FR')} FCFA.`);
        }
        const ecart = 0;
        const updated = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.salaire.update({
                where: { id: salaireId },
                data: { montantVerse: dto.montantVerse, ecart },
            });
            const nomEmploye = `${salaire.user.firstName} ${salaire.user.lastName}`;
            const codeMois = String(salaire.mois).padStart(2, '0');
            await this.rhLog.warn({
                actorId, actorName,
                module: client_1.RhModule.SALAIRE,
                action: 'ENREGISTRER_VERSEMENT',
                entityId: salaireId,
                entityName: `Salaire ${codeMois}/${salaire.annee} — ${nomEmploye}`,
                apres: { montantVerse: dto.montantVerse, ecart },
                message: `Versement de ${dto.montantVerse.toLocaleString('fr-FR')} FCFA enregistré pour ${nomEmploye} — ${codeMois}/${salaire.annee}`,
            }, tx);
            return updated;
        });
        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return updated;
    }
    async genererFicheDePaie(salaireId, dto, actorId) {
        if (!salaireId)
            throw new common_1.BadRequestException("L'identifiant du salaire est requis");
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const jourDePaie = new Date(dto.jourDePaie);
        const finAujourdhui = new Date();
        finAujourdhui.setHours(23, 59, 59, 999);
        if (jourDePaie > finAujourdhui) {
            throw new common_1.BadRequestException(`La date de paiement (${jourDePaie.toLocaleDateString('fr-FR')}) ne peut pas être dans le futur`);
        }
        const [salaire, actorName, entreprise] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                include: {
                    user: {
                        select: {
                            id: true, firstName: true, lastName: true,
                            email: true, dateRecrutement: true,
                            phoneNumber: true, adresse: true, profilePicture: true,
                            role: { select: { post: true } },
                        },
                    },
                    ficheDePaie: true,
                    absence: true,
                    retard: true,
                },
            }),
            this.rhLog.resolveActorName(actorId),
            this.entrepriseService.findFirst(),
        ]);
        if (!salaire)
            throw new common_1.NotFoundException(`Salaire #${salaireId} introuvable`);
        if (!salaire.estCloture) {
            throw new common_1.BadRequestException('Le salaire doit être clôturé avant de générer la fiche de paie');
        }
        if (salaire.ficheDePaie) {
            throw new common_1.ConflictException('Une fiche de paie a déjà été générée pour ce salaire');
        }
        const joursAbsence = salaire.absence?.jours ?? [];
        const joursRetard = salaire.retard?.jours ?? [];
        const salaireAvecDetails = Object.assign(salaire, {
            joursAbsence,
            joursRetard,
            jourDePaie: dto.jourDePaie,
        });
        const fichierPDF = await this.pdfGen.genererFichePaie(salaireAvecDetails, entreprise, this.pdfGen.OUTPUT_DIR_FICHES);
        const ficheCreee = await this.prisma.$transaction(async (tx) => {
            const fiche = await tx.ficheDePaie.create({
                data: {
                    salaireId,
                    dateGeneration: new Date(),
                    fichierPDF,
                    jourDePaie,
                },
                include: {
                    salaire: {
                        select: {
                            id: true, mois: true, annee: true, salaireNet: true, estCloture: true,
                            user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
                        },
                    },
                },
            });
            const codeMois = String(salaire.mois).padStart(2, '0');
            const nomEmploye = salaire.user
                ? `${salaire.user.firstName} ${salaire.user.lastName}`
                : 'Employé inconnu';
            const datePayeString = jourDePaie.toLocaleDateString('fr-FR');
            await this.rhLog.info({
                actorId, actorName,
                module: client_1.RhModule.FICHE_PAIE,
                action: 'GENERER_FICHE_PAIE',
                entityId: fiche.id,
                entityName: `Fiche ${codeMois}/${salaire.annee} — ${nomEmploye}`,
                apres: { fichierPDF, jourDePaie: datePayeString },
                message: `Fiche de paie générée pour ${nomEmploye} — ${codeMois}/${salaire.annee} — Payé le ${datePayeString}`,
            }, tx);
            return fiche;
        });
        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return ficheCreee;
    }
    async getFicheStream(salaireId) {
        if (!salaireId)
            throw new common_1.BadRequestException("L'identifiant du salaire est requis");
        const salaire = await this.prisma.salaire.findUnique({
            where: { id: salaireId },
            include: {
                ficheDePaie: true,
                user: {
                    select: {
                        id: true, firstName: true, lastName: true, profilePicture: true
                    },
                },
            },
        });
        if (!salaire) {
            throw new common_1.NotFoundException(`Salaire #${salaireId} introuvable`);
        }
        if (!salaire.estCloture) {
            throw new common_1.BadRequestException('Le salaire doit être clôturé avant de télécharger la fiche de paie');
        }
        if (!salaire.ficheDePaie) {
            throw new common_1.NotFoundException('Aucune fiche de paie générée pour ce salaire — ' +
                'utilisez POST /generer-fiche-de-paie d\'abord');
        }
        const fichierPDF = salaire.ficheDePaie.fichierPDF;
        if (!fichierPDF) {
            throw new common_1.NotFoundException('Le chemin du fichier PDF est manquant en base');
        }
        try {
            await fs.promises.access(fichierPDF, fs.constants.R_OK);
        }
        catch {
            throw new common_1.NotFoundException('Le fichier PDF n\'existe plus sur le serveur — régénérez la fiche de paie');
        }
        const codeMois = String(salaire.mois).padStart(2, '0');
        const nomEmploye = salaire.user
            ? `${salaire.user.firstName}_${salaire.user.lastName}`
            : 'employe';
        return {
            stream: fs.createReadStream(fichierPDF),
            filename: `fiche_paie_${nomEmploye}_${codeMois}-${salaire.annee}.pdf`,
            mimeType: 'application/pdf',
        };
    }
    async findAll(dto) {
        const where = {};
        if (dto.userId)
            where.userId = dto.userId;
        if (dto.mois)
            where.mois = dto.mois;
        if (dto.annee)
            where.annee = dto.annee;
        if (dto.estCloture !== undefined)
            where.estCloture = dto.estCloture;
        const page = dto.page ?? 1;
        const limit = dto.limit ?? 10;
        const skip = (page - 1) * limit;
        const [total, data] = await Promise.all([
            this.prisma.salaire.count({ where }),
            this.prisma.salaire.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profilePicture: true
                        },
                    },
                    absence: true,
                    retard: true,
                    ficheDePaie: {
                        select: { id: true, dateGeneration: true },
                    },
                },
                orderBy: [
                    { annee: 'desc' },
                    { mois: 'desc' },
                    { createdAt: 'desc' },
                ],
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
    async findOne(salaireId) {
        if (!salaireId) {
            throw new common_1.BadRequestException("L'identifiant du salaire est requis");
        }
        const salaire = await this.prisma.salaire.findUnique({
            where: { id: salaireId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: { select: { post: true } },
                        profilePicture: true,
                    },
                },
                absence: true,
                retard: true,
                ficheDePaie: true,
            },
        });
        if (!salaire) {
            throw new common_1.NotFoundException(`Salaire #${salaireId} introuvable`);
        }
        const joursAbsence = salaire.absence?.jours ?? [];
        const joursRetard = salaire.retard?.jours ?? [];
        return Object.assign(salaire, {
            absence: salaire.absence ? { ...salaire.absence, jours: joursAbsence } : null,
            retard: salaire.retard ? { ...salaire.retard, jours: joursRetard } : null,
        });
    }
    async getMasseSalariale(dto) {
        const { mois, annee, page = 1, limit = 10 } = dto;
        const skip = (page - 1) * limit;
        const whereCondition = { mois, annee, estCloture: true };
        const [agregatsDb, salaires] = await Promise.all([
            this.prisma.salaire.aggregate({
                where: whereCondition,
                _count: { id: true },
                _sum: {
                    salaireBrut: true,
                    totalDeductions: true,
                    totalPrimes: true,
                    salaireNet: true,
                    montantVerse: true,
                },
            }),
            this.prisma.salaire.findMany({
                where: whereCondition,
                select: {
                    id: true,
                    salaireBrut: true,
                    totalDeductions: true,
                    totalPrimes: true,
                    salaireNet: true,
                    montantVerse: true,
                    mois: true,
                    annee: true,
                    estCloture: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: { select: { post: true } },
                            profilePicture: true,
                        },
                    },
                },
                orderBy: [{ user: { lastName: 'asc' } }],
                skip,
                take: limit,
            }),
        ]);
        const totalEmployesMois = agregatsDb._count.id;
        const totalNet = Number(agregatsDb._sum.salaireNet ?? 0);
        const totalVerse = Number(agregatsDb._sum.montantVerse ?? 0);
        return {
            periode: `${String(mois).padStart(2, '0')}/${annee}`,
            agregatsGlobaux: {
                totalBrut: Number(agregatsDb._sum.salaireBrut ?? 0),
                totalDeductions: Number(agregatsDb._sum.totalDeductions ?? 0),
                totalPrimes: Number(agregatsDb._sum.totalPrimes ?? 0),
                totalNet,
                totalVerse,
                ecartTotal: totalVerse - totalNet,
            },
            data: salaires,
            meta: {
                total: totalEmployesMois,
                page,
                limit,
                pagesTotales: Math.ceil(totalEmployesMois / limit) || 1,
            },
        };
    }
    async getHistoriquePaiements(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, firstName: true, lastName: true, email: true },
        });
        if (!user)
            throw new common_1.NotFoundException(`Employé #${userId} introuvable`);
        const { page = 1, limit = 20, annee, mois, montantMinimum, montantMaximum, avecEcart, avecFiche, ficheSigne, dateClotureDebut, dateClotureFin, } = dto;
        const skip = (page - 1) * limit;
        const where = {
            userId,
            estCloture: true,
            montantVerse: { not: null },
            ...(annee && { annee }),
            ...(mois && { mois }),
            ...(montantMinimum !== undefined || montantMaximum !== undefined
                ? {
                    montantVerse: {
                        not: null,
                        ...(montantMinimum !== undefined && { gte: montantMinimum }),
                        ...(montantMaximum !== undefined && { lte: montantMaximum }),
                    },
                }
                : {}),
            ...(avecEcart === true && {
                ecart: { not: 0 },
            }),
            ...(avecFiche === true && { ficheDePaie: { isNot: null } }),
            ...(avecFiche === false && { ficheDePaie: { is: null } }),
            ...(ficheSigne !== undefined && {
                ficheDePaie: { signeeParUser: ficheSigne },
            }),
            ...(dateClotureDebut || dateClotureFin
                ? {
                    dateCloture: {
                        ...(dateClotureDebut && { gte: new Date(dateClotureDebut) }),
                        ...(dateClotureFin && { lte: new Date(dateClotureFin) }),
                    },
                }
                : {}),
        };
        const [total, paiements, agregats] = await Promise.all([
            this.prisma.salaire.count({ where }),
            this.prisma.salaire.findMany({
                where,
                orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
                skip,
                take: limit,
                select: {
                    id: true,
                    mois: true,
                    annee: true,
                    salaireBrut: true,
                    totalDeductions: true,
                    totalPrimes: true,
                    salaireNet: true,
                    montantVerse: true,
                    ecart: true,
                    dateCloture: true,
                    ficheDePaie: {
                        select: {
                            id: true,
                            dateGeneration: true,
                            signeeParUser: true,
                            dateSignature: true,
                            jourDePaie: true,
                        },
                    },
                },
            }),
            this.prisma.salaire.aggregate({
                where,
                _sum: {
                    montantVerse: true,
                    salaireNet: true,
                    totalDeductions: true,
                    totalPrimes: true,
                },
                _count: { id: true },
            }),
        ]);
        return {
            employe: user,
            filtresAppliques: {
                annee: annee ?? null,
                mois: mois ?? null,
                montantMinimum: montantMinimum ?? null,
                montantMaximum: montantMaximum ?? null,
                avecEcart: avecEcart ?? null,
                avecFiche: avecFiche ?? null,
                ficheSigne: ficheSigne ?? null,
                dateClotureDebut: dateClotureDebut ?? null,
                dateClotureFin: dateClotureFin ?? null,
            },
            agregats: {
                totalPaiements: agregats._count.id,
                totalVerse: Number(agregats._sum.montantVerse ?? 0),
                totalNet: Number(agregats._sum.salaireNet ?? 0),
                totalDeductions: Number(agregats._sum.totalDeductions ?? 0),
                totalPrimes: Number(agregats._sum.totalPrimes ?? 0),
            },
            data: paiements.map((p) => ({
                id: p.id,
                periode: `${String(p.mois).padStart(2, '0')}/${p.annee}`,
                mois: p.mois,
                annee: p.annee,
                salaireBrut: Number(p.salaireBrut),
                totalDeductions: Number(p.totalDeductions),
                totalPrimes: Number(p.totalPrimes),
                salaireNet: Number(p.salaireNet),
                montantVerse: Number(p.montantVerse),
                ecart: Number(p.ecart ?? 0),
                aEcart: Number(p.ecart ?? 0) !== 0,
                dateCloture: p.dateCloture,
                ficheDePaie: p.ficheDePaie ?? null,
            })),
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
};
exports.SalaireService = SalaireService;
exports.SalaireService = SalaireService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        entreprise_service_1.EntrepriseService,
        pdf_generator_service_1.PdfGeneratorService,
        rh_log_service_1.RhLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], SalaireService);
//# sourceMappingURL=salaire.service.js.map