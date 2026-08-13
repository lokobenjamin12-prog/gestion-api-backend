export type EntityModule = 'user' | 'role' | 'permission' | 'salessession' | 'absence' | 'contrat' | 'department' | 'rapport' | 'retard' | 'salaire' | 'article' | 'category';
export type EntityChangedAction = 'created' | 'updated' | 'deleted' | 'restored';
export interface EntityChangedEvent {
    module: EntityModule;
    action: EntityChangedAction;
    id?: string | number;
}
