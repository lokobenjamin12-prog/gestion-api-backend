import { ContratType } from '@prisma/client';
export declare class CreateContratDto {
    userId: string;
    type: ContratType;
    dateDebut: string;
    dateFin?: string;
}
