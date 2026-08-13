import { RapportType } from '@prisma/client';
export declare class FilterRapportDto {
    type?: RapportType;
    userId?: string;
    mois?: number;
    annee?: number;
    includeArchived?: boolean;
    page?: number;
    limit?: number;
}
