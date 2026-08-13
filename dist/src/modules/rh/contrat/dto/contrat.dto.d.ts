import { ContratType } from '@prisma/client';
export declare class CreateContratDto {
    userId: string;
    type: ContratType;
    dateDebut: string;
    dateFin?: string;
}
declare const UpdateContratDto_base: import("@nestjs/common").Type<Partial<CreateContratDto>>;
export declare class UpdateContratDto extends UpdateContratDto_base {
}
export {};
