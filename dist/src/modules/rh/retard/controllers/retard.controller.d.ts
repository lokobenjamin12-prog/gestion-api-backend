import { AjouterRetardDto } from '../dto/ajouter-retard-dto';
import { RetardService } from '../services/retard.service';
import { MettreAJourJourRetardDto } from '../dto/mettreAjour-jour-retard.dto';
import { SupprimerJourRetardDto } from '../dto/supprimer-jour-retard.dto';
import { FindAllRetardsDto } from '../dto/find-all-retards.dto';
import { FindOneRetardDto } from '../dto/find-one-retard-dto';
export declare class RetardController {
    private readonly retardService;
    constructor(retardService: RetardService);
    ajouterJours(dto: AjouterRetardDto, actorId: string): Promise<any>;
    mettreAJourJour(dto: MettreAJourJourRetardDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mois: number;
        annee: number;
        jours: import("@prisma/client/runtime/client").JsonValue;
        salaireId: string | null;
    }>;
    supprimerJour(dto: SupprimerJourRetardDto, actorId: string): Promise<any>;
    findAll(dto: FindAllRetardsDto): Promise<{
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
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findOne(dto: FindOneRetardDto): Promise<{
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
