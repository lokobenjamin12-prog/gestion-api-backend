import type { Response } from 'express';
import { RapportService } from '../services/rapport.service';
import { CreateRapportDto } from '../dto/create-rapport.dto';
import { FilterRapportDto } from '../dto/filter-rapport.dto';
export declare class RapportController {
    private readonly rapportService;
    constructor(rapportService: RapportService);
    generer(dto: CreateRapportDto, actorId: string): Promise<{
        rapport: {
            id: string;
            createdAt: Date;
            estArchive: boolean;
            type: import("@prisma/client").$Enums.RapportType;
            deletedAt: Date | null;
            userId: string | null;
            mois: number | null;
            annee: number | null;
            dateGeneration: Date;
            formatExport: import("@prisma/client").$Enums.ExportFormat;
            fichier: string | null;
            periode: string;
        };
        fichier: string;
        avertissement: any;
    }>;
    telechargerRapport(id: string, res: Response): Promise<void>;
    findAll(filters: FilterRapportDto): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            estArchive: boolean;
            type: import("@prisma/client").$Enums.RapportType;
            deletedAt: Date | null;
            userId: string | null;
            mois: number | null;
            annee: number | null;
            dateGeneration: Date;
            formatExport: import("@prisma/client").$Enums.ExportFormat;
            fichier: string | null;
            periode: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pagesTotales: number;
        };
    }>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        estArchive: boolean;
        type: import("@prisma/client").$Enums.RapportType;
        deletedAt: Date | null;
        userId: string | null;
        mois: number | null;
        annee: number | null;
        dateGeneration: Date;
        formatExport: import("@prisma/client").$Enums.ExportFormat;
        fichier: string | null;
        periode: string;
    }>;
    softDelete(id: string, actorId: string): Promise<{
        message: string;
    }>;
    restore(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
