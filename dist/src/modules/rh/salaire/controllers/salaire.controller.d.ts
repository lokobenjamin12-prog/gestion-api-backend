import type { Response } from 'express';
import { SalaireService } from '../services/salaire.service';
import { InitialiserSalaireDto } from '../dto/initialiser.salaire.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenererFicheDto } from '../dto/generer-fiche.dto';
import { AjouterPrimeDto } from '../dto/ajouter.prime.dto';
import { SupprimerPrimeDto } from '../dto/supprimer-prime.dto';
import { VersementDto } from '../dto/versement.dto';
import { FindAllSalairesDto } from '../dto/find-all-salaires.dto';
import { GetMasseSalarialeDto } from '../dto/get-masse-salariale.dto';
import { HistoriquePaiementsDto } from '../dto/historique-paiements.dto';
export declare class SalaireController {
    private readonly prisma;
    private readonly salaireService;
    constructor(prisma: PrismaService, salaireService: SalaireService);
    initialiser(dto: InitialiserSalaireDto, actorId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        salaireBrut: import("@prisma/client-runtime-utils").Decimal;
        prixJournalier: import("@prisma/client-runtime-utils").Decimal;
        primes: import("@prisma/client/runtime/client").JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: import("@prisma/client-runtime-utils").Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: import("@prisma/client-runtime-utils").Decimal;
        totalDeductions: import("@prisma/client-runtime-utils").Decimal;
        totalPrimes: import("@prisma/client-runtime-utils").Decimal;
        salaireNet: import("@prisma/client-runtime-utils").Decimal;
        montantVerse: import("@prisma/client-runtime-utils").Decimal | null;
        ecart: import("@prisma/client-runtime-utils").Decimal | null;
        estCloture: boolean;
        dateCloture: Date | null;
    }>;
    getMasseSalariale(dto: GetMasseSalarialeDto): Promise<{
        periode: string;
        agregatsGlobaux: {
            totalBrut: number;
            totalDeductions: number;
            totalPrimes: number;
            totalNet: number;
            totalVerse: number;
            ecartTotal: number;
        };
        data: {
            id: string;
            user: {
                id: string;
                role: {
                    post: string;
                };
                email: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
            };
            mois: number;
            annee: number;
            salaireBrut: import("@prisma/client-runtime-utils").Decimal;
            totalDeductions: import("@prisma/client-runtime-utils").Decimal;
            totalPrimes: import("@prisma/client-runtime-utils").Decimal;
            salaireNet: import("@prisma/client-runtime-utils").Decimal;
            montantVerse: import("@prisma/client-runtime-utils").Decimal | null;
            estCloture: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pagesTotales: number;
        };
    }>;
    findAll(dto: FindAllSalairesDto): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
            };
            absence: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                mois: number;
                annee: number;
                jours: import("@prisma/client/runtime/client").JsonValue;
                salaireId: string | null;
            } | null;
            retard: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                mois: number;
                annee: number;
                jours: import("@prisma/client/runtime/client").JsonValue;
                salaireId: string | null;
            } | null;
            ficheDePaie: {
                id: string;
                dateGeneration: Date;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            salaireBrut: import("@prisma/client-runtime-utils").Decimal;
            prixJournalier: import("@prisma/client-runtime-utils").Decimal;
            primes: import("@prisma/client/runtime/client").JsonValue;
            nbJoursOuvrables: number;
            nbAbsJust: number;
            nbAbsInjust: number;
            deductionAbs: import("@prisma/client-runtime-utils").Decimal;
            nbRetardsJust: number;
            nbRetardsInjust: number;
            deductionRetards: import("@prisma/client-runtime-utils").Decimal;
            totalDeductions: import("@prisma/client-runtime-utils").Decimal;
            totalPrimes: import("@prisma/client-runtime-utils").Decimal;
            salaireNet: import("@prisma/client-runtime-utils").Decimal;
            montantVerse: import("@prisma/client-runtime-utils").Decimal | null;
            ecart: import("@prisma/client-runtime-utils").Decimal | null;
            estCloture: boolean;
            dateCloture: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    ajouterPrime(salaireId: string, dto: AjouterPrimeDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        salaireBrut: import("@prisma/client-runtime-utils").Decimal;
        prixJournalier: import("@prisma/client-runtime-utils").Decimal;
        primes: import("@prisma/client/runtime/client").JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: import("@prisma/client-runtime-utils").Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: import("@prisma/client-runtime-utils").Decimal;
        totalDeductions: import("@prisma/client-runtime-utils").Decimal;
        totalPrimes: import("@prisma/client-runtime-utils").Decimal;
        salaireNet: import("@prisma/client-runtime-utils").Decimal;
        montantVerse: import("@prisma/client-runtime-utils").Decimal | null;
        ecart: import("@prisma/client-runtime-utils").Decimal | null;
        estCloture: boolean;
        dateCloture: Date | null;
    }>;
    supprimerPrime(salaireId: string, dto: SupprimerPrimeDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        salaireBrut: import("@prisma/client-runtime-utils").Decimal;
        prixJournalier: import("@prisma/client-runtime-utils").Decimal;
        primes: import("@prisma/client/runtime/client").JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: import("@prisma/client-runtime-utils").Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: import("@prisma/client-runtime-utils").Decimal;
        totalDeductions: import("@prisma/client-runtime-utils").Decimal;
        totalPrimes: import("@prisma/client-runtime-utils").Decimal;
        salaireNet: import("@prisma/client-runtime-utils").Decimal;
        montantVerse: import("@prisma/client-runtime-utils").Decimal | null;
        ecart: import("@prisma/client-runtime-utils").Decimal | null;
        estCloture: boolean;
        dateCloture: Date | null;
    }>;
    cloturerMois(salaireId: string, actorId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
        absence: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            jours: import("@prisma/client/runtime/client").JsonValue;
            salaireId: string | null;
        } | null;
        retard: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            jours: import("@prisma/client/runtime/client").JsonValue;
            salaireId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        salaireBrut: import("@prisma/client-runtime-utils").Decimal;
        prixJournalier: import("@prisma/client-runtime-utils").Decimal;
        primes: import("@prisma/client/runtime/client").JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: import("@prisma/client-runtime-utils").Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: import("@prisma/client-runtime-utils").Decimal;
        totalDeductions: import("@prisma/client-runtime-utils").Decimal;
        totalPrimes: import("@prisma/client-runtime-utils").Decimal;
        salaireNet: import("@prisma/client-runtime-utils").Decimal;
        montantVerse: import("@prisma/client-runtime-utils").Decimal | null;
        ecart: import("@prisma/client-runtime-utils").Decimal | null;
        estCloture: boolean;
        dateCloture: Date | null;
    }>;
    enregistrerVersement(salaireId: string, dto: VersementDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        salaireBrut: import("@prisma/client-runtime-utils").Decimal;
        prixJournalier: import("@prisma/client-runtime-utils").Decimal;
        primes: import("@prisma/client/runtime/client").JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: import("@prisma/client-runtime-utils").Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: import("@prisma/client-runtime-utils").Decimal;
        totalDeductions: import("@prisma/client-runtime-utils").Decimal;
        totalPrimes: import("@prisma/client-runtime-utils").Decimal;
        salaireNet: import("@prisma/client-runtime-utils").Decimal;
        montantVerse: import("@prisma/client-runtime-utils").Decimal | null;
        ecart: import("@prisma/client-runtime-utils").Decimal | null;
        estCloture: boolean;
        dateCloture: Date | null;
    }>;
    genererFicheDePaie(salaireId: string, dto: GenererFicheDto, actorId: string): Promise<{
        salaire: {
            id: string;
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
            };
            mois: number;
            annee: number;
            salaireNet: import("@prisma/client-runtime-utils").Decimal;
            estCloture: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salaireId: string;
        jourDePaie: Date;
        fichierPDF: string | null;
        dateGeneration: Date;
        signeeParUser: boolean;
        dateSignature: Date | null;
    }>;
    telechargerFiche(id: string, res: Response): Promise<void>;
    findOne(salaireId: string): Promise<{
        user: {
            id: string;
            role: {
                post: string;
            };
            email: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
        absence: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            jours: import("@prisma/client/runtime/client").JsonValue;
            salaireId: string | null;
        } | null;
        retard: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            jours: import("@prisma/client/runtime/client").JsonValue;
            salaireId: string | null;
        } | null;
        ficheDePaie: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salaireId: string;
            jourDePaie: Date;
            fichierPDF: string | null;
            dateGeneration: Date;
            signeeParUser: boolean;
            dateSignature: Date | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        salaireBrut: import("@prisma/client-runtime-utils").Decimal;
        prixJournalier: import("@prisma/client-runtime-utils").Decimal;
        primes: import("@prisma/client/runtime/client").JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: import("@prisma/client-runtime-utils").Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: import("@prisma/client-runtime-utils").Decimal;
        totalDeductions: import("@prisma/client-runtime-utils").Decimal;
        totalPrimes: import("@prisma/client-runtime-utils").Decimal;
        salaireNet: import("@prisma/client-runtime-utils").Decimal;
        montantVerse: import("@prisma/client-runtime-utils").Decimal | null;
        ecart: import("@prisma/client-runtime-utils").Decimal | null;
        estCloture: boolean;
        dateCloture: Date | null;
    } & {
        absence: {
            jours: import("../paie.types").JourAbsence[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            salaireId: string | null;
        } | null;
        retard: {
            jours: import("../paie.types").JourRetard[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            salaireId: string | null;
        } | null;
    }>;
    getHistoriquePaiements(userId: string, dto: HistoriquePaiementsDto): Promise<{
        employe: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        filtresAppliques: {
            annee: number | null;
            mois: number | null;
            montantMinimum: number | null;
            montantMaximum: number | null;
            avecEcart: boolean | null;
            avecFiche: boolean | null;
            ficheSigne: boolean | null;
            dateClotureDebut: string | null;
            dateClotureFin: string | null;
        };
        agregats: {
            totalPaiements: number;
            totalVerse: number;
            totalNet: number;
            totalDeductions: number;
            totalPrimes: number;
        };
        data: {
            id: string;
            periode: string;
            mois: number;
            annee: number;
            salaireBrut: number;
            totalDeductions: number;
            totalPrimes: number;
            salaireNet: number;
            montantVerse: number;
            ecart: number;
            aEcart: boolean;
            dateCloture: Date | null;
            ficheDePaie: {
                id: string;
                jourDePaie: Date;
                dateGeneration: Date;
                signeeParUser: boolean;
                dateSignature: Date | null;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
}
