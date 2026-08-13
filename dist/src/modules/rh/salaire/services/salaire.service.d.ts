import * as fs from 'fs';
import { PdfGeneratorService } from 'src/modules/admin/pdf-generator/services/pdf-generator.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { InitialiserSalaireDto } from '../dto/initialiser.salaire.dto';
import { AjouterPrimeDto } from '../dto/ajouter.prime.dto';
import { JourAbsence, JourRetard } from '../paie.types';
import { SupprimerPrimeDto } from '../dto/supprimer-prime.dto';
import { VersementDto } from '../dto/versement.dto';
import { GenererFicheDto } from '../dto/generer-fiche.dto';
import { FindAllSalairesDto } from '../dto/find-all-salaires.dto';
import { GetMasseSalarialeDto } from '../dto/get-masse-salariale.dto';
import { EntrepriseService } from 'src/modules/commerce/entreprise/services/entreprise.service';
import { RhLogService } from '../../log/rh-log.service';
import { HistoriquePaiementsDto } from '../dto/historique-paiements.dto';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';
export declare class SalaireService {
    private readonly prisma;
    private readonly entrepriseService;
    private readonly pdfGen;
    private readonly rhLog;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, entrepriseService: EntrepriseService, pdfGen: PdfGeneratorService, rhLog: RhLogService, realtimeGateway: StockRealtimeGateway);
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
        salaireBrut: Prisma.Decimal;
        prixJournalier: Prisma.Decimal;
        primes: Prisma.JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: Prisma.Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: Prisma.Decimal;
        totalDeductions: Prisma.Decimal;
        totalPrimes: Prisma.Decimal;
        salaireNet: Prisma.Decimal;
        montantVerse: Prisma.Decimal | null;
        ecart: Prisma.Decimal | null;
        estCloture: boolean;
        dateCloture: Date | null;
    }>;
    ajouterPrime(salaireId: string, dto: AjouterPrimeDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        salaireBrut: Prisma.Decimal;
        prixJournalier: Prisma.Decimal;
        primes: Prisma.JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: Prisma.Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: Prisma.Decimal;
        totalDeductions: Prisma.Decimal;
        totalPrimes: Prisma.Decimal;
        salaireNet: Prisma.Decimal;
        montantVerse: Prisma.Decimal | null;
        ecart: Prisma.Decimal | null;
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
        salaireBrut: Prisma.Decimal;
        prixJournalier: Prisma.Decimal;
        primes: Prisma.JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: Prisma.Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: Prisma.Decimal;
        totalDeductions: Prisma.Decimal;
        totalPrimes: Prisma.Decimal;
        salaireNet: Prisma.Decimal;
        montantVerse: Prisma.Decimal | null;
        ecart: Prisma.Decimal | null;
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
            jours: Prisma.JsonValue;
            salaireId: string | null;
        } | null;
        retard: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            jours: Prisma.JsonValue;
            salaireId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        salaireBrut: Prisma.Decimal;
        prixJournalier: Prisma.Decimal;
        primes: Prisma.JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: Prisma.Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: Prisma.Decimal;
        totalDeductions: Prisma.Decimal;
        totalPrimes: Prisma.Decimal;
        salaireNet: Prisma.Decimal;
        montantVerse: Prisma.Decimal | null;
        ecart: Prisma.Decimal | null;
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
        salaireBrut: Prisma.Decimal;
        prixJournalier: Prisma.Decimal;
        primes: Prisma.JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: Prisma.Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: Prisma.Decimal;
        totalDeductions: Prisma.Decimal;
        totalPrimes: Prisma.Decimal;
        salaireNet: Prisma.Decimal;
        montantVerse: Prisma.Decimal | null;
        ecart: Prisma.Decimal | null;
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
            salaireNet: Prisma.Decimal;
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
    getFicheStream(salaireId: string): Promise<{
        stream: fs.ReadStream;
        filename: string;
        mimeType: string;
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
                jours: Prisma.JsonValue;
                salaireId: string | null;
            } | null;
            retard: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                mois: number;
                annee: number;
                jours: Prisma.JsonValue;
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
            salaireBrut: Prisma.Decimal;
            prixJournalier: Prisma.Decimal;
            primes: Prisma.JsonValue;
            nbJoursOuvrables: number;
            nbAbsJust: number;
            nbAbsInjust: number;
            deductionAbs: Prisma.Decimal;
            nbRetardsJust: number;
            nbRetardsInjust: number;
            deductionRetards: Prisma.Decimal;
            totalDeductions: Prisma.Decimal;
            totalPrimes: Prisma.Decimal;
            salaireNet: Prisma.Decimal;
            montantVerse: Prisma.Decimal | null;
            ecart: Prisma.Decimal | null;
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
            jours: Prisma.JsonValue;
            salaireId: string | null;
        } | null;
        retard: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            jours: Prisma.JsonValue;
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
        salaireBrut: Prisma.Decimal;
        prixJournalier: Prisma.Decimal;
        primes: Prisma.JsonValue;
        nbJoursOuvrables: number;
        nbAbsJust: number;
        nbAbsInjust: number;
        deductionAbs: Prisma.Decimal;
        nbRetardsJust: number;
        nbRetardsInjust: number;
        deductionRetards: Prisma.Decimal;
        totalDeductions: Prisma.Decimal;
        totalPrimes: Prisma.Decimal;
        salaireNet: Prisma.Decimal;
        montantVerse: Prisma.Decimal | null;
        ecart: Prisma.Decimal | null;
        estCloture: boolean;
        dateCloture: Date | null;
    } & {
        absence: {
            jours: JourAbsence[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            salaireId: string | null;
        } | null;
        retard: {
            jours: JourRetard[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            mois: number;
            annee: number;
            salaireId: string | null;
        } | null;
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
            salaireBrut: Prisma.Decimal;
            totalDeductions: Prisma.Decimal;
            totalPrimes: Prisma.Decimal;
            salaireNet: Prisma.Decimal;
            montantVerse: Prisma.Decimal | null;
            estCloture: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pagesTotales: number;
        };
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
