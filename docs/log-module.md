# Module Log (central) — Documentation API

Ce document décrit l'API du **module Log central** du backend Ndolecam
(`src/modules/log/`). Il est destiné à un agent/développeur travaillant sur le
frontend React consommant cette API : il couvre les routes, les permissions,
les formats de requête/réponse et des exemples prêts à copier.

Ce module **n'écrit aucun log** : c'est une couche de lecture qui agrège 3
tables d'audit déjà existantes (`AuthLog`, `CommerceLog`, `RhLog`) et les
expose sous une seule arborescence d'URL, une route par sous-module métier.

---

## 1. Informations générales

| | |
|---|---|
| **Base URL** | `http://<host>/api/v1` (préfixe global `api/v1`, voir [main.ts](../src/main.ts)) |
| **Base path du module** | `/logs` |
| **Authentification** | Cookie httpOnly `access_token` (PAS de header `Authorization: Bearer`) |
| **CORS** | `credentials: true` — le frontend doit appeler `fetch(url, { credentials: 'include' })` ou configurer axios avec `withCredentials: true` |
| **Méthode HTTP** | `GET` uniquement (module 100% lecture) |

### Enveloppe de réponse

Toutes les réponses passent par un `ResponseInterceptor` global
([response.interceptor.ts](../src/common/interceptors/response.interceptor.ts)).
Le payload utile est **toujours** dans `data` :

```json
{
  "success": true,
  "data": { /* ... */ },
  "timestamp": "2026-07-28T10:00:00.000Z"
}
```

Toutes les structures ci-dessous décrivent le contenu de `data`.

### Erreurs

| Code | Cas |
|---|---|
| `401` | Cookie `access_token` absent/expiré |
| `403` | Rôle authentifié mais permission manquante (`ForbiddenException`, message `Accès refusé. Permissions manquantes : [...]`) |
| `404` | Ressource introuvable (uniquement sur les endpoints `:id` des modules `auth-logs`/`commerce-logs`/`rh-logs`, non exposés ici) |

Le format d'erreur suit le filtre global
[http-exception.filter.ts](../src/common/filters/http-exception.filter.ts) (à
vérifier côté repo si besoin d'un exemple exact).

---

## 2. Permissions requises

Chaque route est protégée par `@RequirePermissions(...)`. Un utilisateur doit
posséder **tous** les slugs listés pour accéder à la route (logique `AND`),
sauf s'il possède la permission spéciale `Manage_system` (super admin, bypass
total).

| Route | Permission(s) requise(s) |
|---|---|
| `GET /logs` | `auth-log:read` **ET** `commerce-log:read` **ET** `rh-log:read` |
| `GET /logs/stats` | `auth-log:read` **ET** `commerce-log:read` **ET** `rh-log:read` |
| `GET /logs/articles` | `commerce-log:read` |
| `GET /logs/categories` | `commerce-log:read` |
| `GET /logs/mouvements-stock` | `commerce-log:read` |
| `GET /logs/sales-session` | `commerce-log:read` |
| `GET /logs/authentification` | `auth-log:read` |
| `GET /logs/permissions` | `auth-log:read` |
| `GET /logs/roles` | `auth-log:read` |
| `GET /logs/users` | `auth-log:read` |
| `GET /logs/absences` | `rh-log:read` |
| `GET /logs/contrats` | `rh-log:read` |
| `GET /logs/departements` | `rh-log:read` |
| `GET /logs/rapports` | `rh-log:read` |
| `GET /logs/retards` | `rh-log:read` |
| `GET /logs/salaires` | `rh-log:read` |

Ces slugs (`auth-log:read`, `commerce-log:read`, `rh-log:read`) sont ceux déjà
utilisés par les modules existants `/auth-logs`, `/commerce-logs`,
`/rh-logs` — aucun nouveau slug n'a été créé. Si un rôle a déjà accès aux
anciennes routes, il a automatiquement accès aux nouvelles.

Côté UI React, il est recommandé de masquer/afficher chaque onglet du menu
"Logs" selon les permissions du rôle courant (déjà présentes dans le payload
JWT / `/auth/me`, à vérifier selon l'implémentation front existante).

---

## 3. Vue d'ensemble (`GET /logs`)

Retourne la liste des 14 sous-modules disponibles avec leur nombre total
d'entrées. Pratique pour construire dynamiquement un menu latéral ou des
compteurs (badges).

**Requête**

```
GET /api/v1/logs
```

**Réponse (`data`)**

```json
[
  { "key": "articles",          "label": "Articles",             "path": "/logs/articles",          "total": 128 },
  { "key": "categories",        "label": "Catégories",           "path": "/logs/categories",         "total": 42 },
  { "key": "mouvements-stock",  "label": "Mouvements de stock",  "path": "/logs/mouvements-stock",   "total": 310 },
  { "key": "authentification",  "label": "Authentification",     "path": "/logs/authentification",   "total": 512 },
  { "key": "permissions",       "label": "Permissions",          "path": "/logs/permissions",        "total": 18 },
  { "key": "roles",             "label": "Rôles",                "path": "/logs/roles",              "total": 9 },
  { "key": "users",             "label": "Utilisateurs",         "path": "/logs/users",              "total": 76 },
  { "key": "sales-session",     "label": "Sessions de vente",    "path": "/logs/sales-session",      "total": 204 },
  { "key": "absences",          "label": "Absences",             "path": "/logs/absences",           "total": 63 },
  { "key": "contrats",          "label": "Contrats",             "path": "/logs/contrats",           "total": 15 },
  { "key": "departements",      "label": "Départements",         "path": "/logs/departements",       "total": 7 },
  { "key": "rapports",          "label": "Rapports",             "path": "/logs/rapports",           "total": 34 },
  { "key": "retards",           "label": "Retards",              "path": "/logs/retards",            "total": 21 },
  { "key": "salaires",          "label": "Salaires",             "path": "/logs/salaires",           "total": 58 }
]
```

> Note technique : cet endpoint fait 14 requêtes de comptage en parallèle
> (une par sous-module). C'est acceptable pour un usage "dashboard admin" à
> faible fréquence, à éviter en polling rapide/fréquent.

---

## 4. Statistiques globales (`GET /logs/stats`)

Combine les stats des 3 tables sources (`AuthLog`, `CommerceLog`, `RhLog`).

**Requête**

```
GET /api/v1/logs/stats
```

**Réponse (`data`)**

```json
{
  "total": 1497,
  "authentification": {
    "total": 512,
    "parLevel":  [{ "level": "INFO", "count": 480 }, { "level": "WARNING", "count": 25 }, { "level": "ERROR", "count": 7 }],
    "parModule": [{ "module": "AUTH", "count": 300 }, { "module": "USER", "count": 150 }, { "module": "ROLE", "count": 40 }, { "module": "PERMISSION", "count": 22 }],
    "parState":  [{ "state": "SUCCESS", "count": 490 }, { "state": "FAILED", "count": 22 }]
  },
  "commerce": {
    "total": 684,
    "parLevel":  [ /* idem */ ],
    "parModule": [{ "module": "STOCK", "count": 480 }, { "module": "SALES_SESSION", "count": 204 }, { "module": "ENTREPRISE", "count": 0 }],
    "parState":  [ /* idem */ ]
  },
  "rh": {
    "total": 301,
    "parLevel":  [ /* idem */ ],
    "parModule": [{ "module": "ABSENCE", "count": 63 }, { "module": "CONTRAT", "count": 15 }, { "module": "DEPARTMENT", "count": 7 }, { "module": "RAPPORT", "count": 34 }, { "module": "RETARD", "count": 21 }, { "module": "SALAIRE", "count": 58 }, { "module": "FICHE_PAIE", "count": 0 }],
    "parState":  [ /* idem */ ]
  }
}
```

> `commerce.parModule` contient un total `STOCK` global — il **n'est pas**
> décomposé en Article/Catégorie/Mouvement-stock ici (voir §6 pour le pourquoi).
> Pour ce détail, utilisez les endpoints `/logs/articles`, `/logs/categories`,
> `/logs/mouvements-stock` et lisez `meta.total` de chaque réponse.

---

## 5. Endpoints "liste par sous-module"

Les 14 routes suivantes partagent **exactement** la même forme de requête et
de réponse (pagination + filtres communs).

### 5.1 Query params (tous optionnels)

| Param | Type | Défaut | Description |
|---|---|---|---|
| `page` | `number` | `1` | Numéro de page (≥ 1) |
| `limit` | `number` | `20` | Taille de page (1–100) |
| `actorId` | `string` | — | Filtrer par l'ID de l'utilisateur auteur de l'action |
| `level` | `INFO \| WARNING \| ERROR \| CRITICAL` | — | Niveau de sévérité |
| `state` | `SUCCESS \| FAILED` | — | Résultat de l'action |
| `dateDebut` | `string (ISO 8601)` | — | Borne inférieure sur `createdAt` |
| `dateFin` | `string (ISO 8601)` | — | Borne supérieure sur `createdAt` |

> Contrairement aux anciennes routes `/auth-logs`, `/commerce-logs`,
> `/rh-logs`, ces routes **n'exposent pas** de param `module` ni `action` :
> le sous-module est déjà déterminé par l'URL elle-même.

### 5.2 Forme de la réponse (`data`)

```ts
interface LogListResponse {
  data: LogEntrySummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

`LogEntrySummary` (champs communs aux 3 tables sources ; `valeurAvant` /
`valeurApres` sont **volontairement exclus** du listing pour rester léger —
voir §7 si un jour un détail unitaire est nécessaire) :

```ts
interface LogEntrySummary {
  id: string;
  actorId: string | null;
  actorName: string | null;
  module: string;        // valeur de l'enum Prisma correspondant (voir §6)
  action: string;        // ex: "UPDATE_ARTICLE", "auth.login.success", "CREATE_CONTRAT"
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  entityId: string | null;
  entityName: string | null;
  state: 'SUCCESS' | 'FAILED';
  message: string;
  createdAt: string;      // ISO 8601
  email?: string | null;  // présent uniquement sur authentification/permissions/roles/users (source AuthLog)
}
```

### 5.3 Exemple — `GET /logs/absences?page=1&limit=10&level=WARNING`

```json
{
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9",
      "actorId": "usr_lmlk89210",
      "actorName": "Heidi Fokou",
      "module": "ABSENCE",
      "action": "CREATE_ABSENCE",
      "level": "WARNING",
      "entityId": "abs_9f8e7d6c",
      "entityName": "Absence #9f8e7d6c",
      "state": "SUCCESS",
      "message": "Absence déclarée pour cause de maladie",
      "createdAt": "2026-07-27T08:12:00.000Z"
    }
  ],
  "meta": {
    "total": 63,
    "page": 1,
    "limit": 10,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 5.4 Tableau récapitulatif des 14 routes

| Route | Table source | Filtre appliqué en interne |
|---|---|---|
| `GET /logs/articles` | `CommerceLog` | `module=STOCK` + `action` contient `"ARTICLE"` |
| `GET /logs/categories` | `CommerceLog` | `module=STOCK` + `action` contient `"CATEGOR"` |
| `GET /logs/mouvements-stock` | `CommerceLog` | `module=STOCK` + `action` contient `"MOUVEMENT"` |
| `GET /logs/sales-session` | `CommerceLog` | `module=SALES_SESSION` |
| `GET /logs/authentification` | `AuthLog` | `module=AUTH` |
| `GET /logs/permissions` | `AuthLog` | `module=PERMISSION` |
| `GET /logs/roles` | `AuthLog` | `module=ROLE` |
| `GET /logs/users` | `AuthLog` | `module=USER` |
| `GET /logs/absences` | `RhLog` | `module=ABSENCE` |
| `GET /logs/contrats` | `RhLog` | `module=CONTRAT` |
| `GET /logs/departements` | `RhLog` | `module=DEPARTMENT` |
| `GET /logs/rapports` | `RhLog` | `module=RAPPORT` |
| `GET /logs/retards` | `RhLog` | `module=RETARD` |
| `GET /logs/salaires` | `RhLog` | `module=SALAIRE` |

---

## 6. Point d'attention : Article / Catégorie / Mouvement-stock

En base, il n'existe **qu'un seul** module d'audit commercial pour le stock :
l'enum Prisma `CommerceModule.STOCK`. Les actions `CREATE_SIMPLE_ARTICLE`,
`UPDATE_CATEGORY`, `MOUVEMENT_ENTREE`, etc. y sont toutes journalisées avec
le même `module: "STOCK"` — elles ne se distinguent que par le **préfixe du
champ `action`**.

Le module Log central applique donc un filtre "contains" sur `action` :

- `ARTICLE` → couvre `CREATE_SIMPLE_ARTICLE`, `CREATE_ARTICLE_FULL`,
  `READ_ARTICLES`, `READ_ARTICLE_DETAIL`, `READ_CATEGORIES_BY_ARTICLE`,
  `UPDATE_ARTICLE`, `SOFT_DELETE_ARTICLE`, `RESTORE_ARTICLE`,
  `HARD_DELETE_ARTICLE`.
- `CATEGOR` (volontairement sans "Y" final, pour matcher `CATEGORY` **et**
  `CATEGORIES`) → couvre `CREATE_CATEGORY_WITH_STOCK`, `CREATE_CATEGORY_ERROR`,
  `READ_CATEGORIES_PAGINATED`, `READ_CATEGORY_DETAIL`, `UPDATE_CATEGORY`,
  `SOFT_DELETE_CATEGORY`, `RESTORE_CATEGORY`, `HARD_DELETE_CATEGORY`, ainsi
  que `READ_CATEGORIES_BY_ARTICLE` (qui apparaît donc **aussi** dans
  `/logs/articles` — c'est intentionnel : cette action concerne les deux).
- `MOUVEMENT` → couvre `MOUVEMENT_ENTREE`, `MOUVEMENT_SORTIE`, etc.

**Conséquence pour le front** : ne pas s'étonner qu'une action apparaisse
dans deux listes (ex: `READ_CATEGORIES_BY_ARTICLE` dans Articles ET
Catégories) — ce n'est pas un doublon en base, juste un log pertinent pour
les deux vues.

Aucune migration de schéma n'a été faite : c'est un choix délibéré pour ne
pas toucher au code d'écriture des logs déjà en production
(`article.service.ts`, `category.service.ts`, `stock.service.ts`).

---

## 7. Ce que ce module n'expose PAS (volontairement)

- **Détail unitaire d'un log** (`GET /logs/:id` avec `valeurAvant`/
  `valeurApres`) : non dupliqué ici. Utilisez directement les routes
  existantes `GET /auth-logs/:id`, `GET /commerce-logs/:id`,
  `GET /rh-logs/:id` si le detail (diff avant/après) est nécessaire.
- **Historique par acteur** (`/actor/:actorId`) : idem, disponible sur les
  3 anciens modules (`/auth-logs/actor/:id`, etc.), pas dupliqué ici.
- **Écriture de logs** : ce module est 100% lecture. Les logs continuent
  d'être écrits par les services métier existants (`AuthLogService`,
  `CommerceLogService`, `RhLogService`) exactement comme avant.

---

## 8. Exemples d'intégration React

### 8.1 Fetch natif

```ts
async function fetchLogSubModule(key: string, params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE_URL}/logs/${key}${query ? `?${query}` : ''}`, {
    credentials: 'include', // indispensable : auth par cookie httpOnly
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const { data } = await res.json();
  return data; // { data: LogEntrySummary[], meta: {...} }
}
```

### 8.2 Axios

```ts
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

export function getLogOverview() {
  return api.get('/logs').then((r) => r.data.data as LogSubModuleSummary[]);
}

export function getLogsBySubModule(key: string, params?: LogQueryParams) {
  return api.get(`/logs/${key}`, { params }).then((r) => r.data.data as LogListResponse);
}
```

### 8.3 Menu latéral dynamique

`GET /logs` renvoie directement `label` + `path` + `total` pour chaque
sous-module : il suffit d'itérer sur le tableau pour construire les onglets
du menu "Logs" sans coder les 14 libellés en dur côté front (mais il faut
quand même filtrer selon les permissions du rôle courant, voir §2).

---

## 9. Fichiers source (backend)

| Fichier | Rôle |
|---|---|
| [src/modules/log/log.module.ts](../src/modules/log/log.module.ts) | Déclaration du module Nest |
| [src/modules/log/log.controller.ts](../src/modules/log/log.controller.ts) | Les 16 routes HTTP |
| [src/modules/log/log.service.ts](../src/modules/log/log.service.ts) | Logique d'agrégation/délégation vers `AuthLogService`, `CommerceLogService`, `RhLogService` |
| [src/modules/log/dto/log-query-filters.dto.ts](../src/modules/log/dto/log-query-filters.dto.ts) | DTO des query params communs |
