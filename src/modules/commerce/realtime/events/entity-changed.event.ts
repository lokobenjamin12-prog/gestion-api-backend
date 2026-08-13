// Événement générique 'entity.changed' — signal d'invalidation (« va recharger tes
// données »), pas un payload dénormalisé comme StockUpdatedEvent. Toutes les pages
// concernées utilisent déjà TanStack Query avec invalidateQueries, donc un seul
// événement générique suffit pour les 10 modules ci-dessous plutôt qu'un payload
// dédié par module.
export type EntityModule =
  | 'user'
  | 'role'
  | 'permission'
  | 'salessession'
  | 'absence'
  | 'contrat'
  | 'department'
  | 'rapport'
  | 'retard'
  | 'salaire'
  | 'article'
  | 'category';

export type EntityChangedAction = 'created' | 'updated' | 'deleted' | 'restored';

export interface EntityChangedEvent {
  module: EntityModule;
  action: EntityChangedAction;
  id?: string | number;
}
