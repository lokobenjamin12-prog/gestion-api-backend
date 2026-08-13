import { ExportFormat, RapportType } from '@prisma/client';
export declare class CreateRapportDto {
    type: RapportType;
    mois?: number;
    annee?: number;
    userId?: string;
    formatExport: ExportFormat;
    page?: number;
    limit?: number;
}
