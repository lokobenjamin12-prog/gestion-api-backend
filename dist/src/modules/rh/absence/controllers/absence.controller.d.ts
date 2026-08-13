import { AbsenceService } from '../services/absence.service';
import { AjouterAbsenceDto } from '../dto/ajouter-absence.dto';
import { MettreAJourJourAbsenceDto } from '../dto/mettre-a-jour-jour-absence.dto';
import { SupprimerJourAbsenceDto } from '../dto/supprimer-jour-absencedto';
import { FindAllAbsencesDto } from '../dto/find-all-absences.dto';
import { FindOneAbsenceDto } from '../dto/find-one-absence.dto';
export declare class AbsenceController {
    private readonly absenceService;
    constructor(absenceService: AbsenceService);
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
