import { TypeMouvement } from '@prisma/client';
export declare class CreateMovementDto {
    articleStockId: string;
    type: TypeMouvement;
    quantite: number;
    motif?: string;
    movementDate: Date;
}
