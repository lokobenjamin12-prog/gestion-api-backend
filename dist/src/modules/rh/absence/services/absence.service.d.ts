import { PrismaService } from 'src/prisma/prisma.service';
import { AjouterAbsenceDto } from '../dto/ajouter-absence.dto';
import { MettreAJourJourAbsenceDto } from '../dto/mettre-a-jour-jour-absence.dto';
import { SupprimerJourAbsenceDto } from '../dto/supprimer-jour-absencedto';
import { FindAllAbsencesDto } from '../dto/find-all-absences.dto';
import { FindOneAbsenceDto } from '../dto/find-one-absence.dto';
import { RhLogService } from '../../log/rh-log.service';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';
export declare class AbsenceService {
    private readonly prisma;
    private readonly rhLog;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, rhLog: RhLogService, realtimeGateway: StockRealtimeGateway);
    private assertSalaireOuvert;
    private assertPasDeConflitRetard;
    ajouterJours(dto: AjouterAbsenceDto, actorId: string): Promise<any>;
    mettreAJourJour(dto: MettreAJourJourAbsenceDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        jours: import("@prisma/client/runtime/client").JsonValue;
        salaireId: string | null;
    }>;
    supprimerJour(dto: SupprimerJourAbsenceDto, actorId: string): Promise<any>;
    findAll(dto: FindAllAbsencesDto): Promise<{
        data: ({
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
            jours: import("@prisma/client/runtime/client").JsonValue;
            salaireId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(dto: FindOneAbsenceDto): Promise<{
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
        jours: import("@prisma/client/runtime/client").JsonValue;
        salaireId: string | null;
    }>;
}
