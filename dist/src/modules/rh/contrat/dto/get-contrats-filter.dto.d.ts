import { ContratType } from '@prisma/client';
export declare class GetContratsFilterDto {
    userId?: string;
    type?: ContratType;
    dateDebutFrom?: string;
    dateDebutTo?: string;
    includeArchived?: boolean;
    page?: number;
    limit?: number;
}
