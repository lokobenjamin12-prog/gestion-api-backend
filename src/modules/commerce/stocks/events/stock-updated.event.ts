import { TypeSeuil } from '@prisma/client';

// Événement 'stock.updated' — émis après commit réussi par les 4 routes qui modifient
// ArticleStock.quantiteActuelle (mouvements, open/close/cancel session).
// `articleStockId` reprend le nom de la FK réelle du schéma Prisma (ArticleStock.id) plutôt que
// les variantes déjà en circulation ailleurs dans l'API (stockId, id, articleId) pour ne pas
// reproduire l'incohérence de nommage existante.
export interface StockUpdatedEvent {
  articleStockId: string;
  quantite: number;
  niveauAlerte: TypeSeuil;
}
