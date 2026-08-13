import { TypeSeuil } from '@prisma/client';
export interface StockUpdatedEvent {
    articleStockId: string;
    quantite: number;
    niveauAlerte: TypeSeuil;
}
