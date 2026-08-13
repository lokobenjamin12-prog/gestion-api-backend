import { EntityModule } from './events/entity-changed.event';

// Une room par module métier, rejointe à la connexion uniquement si le socket a la
// permission ':read' correspondante (même logique que PermissionsGuard côté HTTP).
export const ENTITY_ROOMS: Record<EntityModule, { room: string; permission: string }> = {
  user: { room: 'user-updates', permission: 'user:read' },
  role: { room: 'role-updates', permission: 'role:read' },
  permission: { room: 'permission-updates', permission: 'permission:read' },
  salessession: { room: 'salessession-updates', permission: 'salessession:read' },
  absence: { room: 'absence-updates', permission: 'absence:read' },
  contrat: { room: 'contrat-updates', permission: 'contrat:read' },
  department: { room: 'department-updates', permission: 'department:read' },
  rapport: { room: 'rapport-updates', permission: 'rapport:read' },
  retard: { room: 'retard-updates', permission: 'retard:read' },
  salaire: { room: 'salaire-updates', permission: 'salaire:read' },
  article: { room: 'article-updates', permission: 'article:read' },
  category: { room: 'category-updates', permission: 'category:read' },
};

// Bypass Super Admin — même slug que celui vérifié dans PermissionsGuard.
export const MANAGE_SYSTEM_SLUG = 'Manage_system';
