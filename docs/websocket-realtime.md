# WebSocket temps réel — Documentation

Ce document décrit **ce qu'est un WebSocket**, puis **comment il est implémenté**
dans ce backend (`src/modules/commerce/realtime/`) : le Gateway unique, son
authentification, le système de rooms par permission, les deux événements
émis, et la liste complète des routes qui déclenchent une émission.

Il est destiné à un développeur (frontend ou backend) qui doit brancher un
client dessus ou étendre le système à un nouveau module.

---

## 1. C'est quoi un WebSocket ?

Un WebSocket est un **protocole de connexion bidirectionnelle persistante**
entre un client (navigateur) et un serveur, à la différence d'une requête
HTTP classique qui est **unidirectionnelle et éphémère** (le client demande,
le serveur répond, la connexion se referme).

| | HTTP classique (REST) | WebSocket |
|---|---|---|
| Qui parle en premier | Toujours le client | Les deux, à tout moment |
| Durée de la connexion | Une requête = une connexion (fermée après la réponse) | Une seule connexion ouverte, réutilisée indéfiniment |
| Le serveur peut-il "pousser" une info sans qu'on la demande ? | Non — il faut que le client re-demande (polling) | Oui — `server.emit(...)` à tout moment |
| Cas d'usage typique | CRUD classique (`GET /users`, `POST /users`) | Notifications live, chat, dashboards qui se mettent à jour tout seuls |

Concrètement : la connexion démarre comme une requête HTTP normale
(le "handshake"), puis le protocole **bascule** ("upgrade") vers une
connexion TCP maintenue ouverte où client et serveur peuvent s'envoyer des
messages dans les deux sens sans jamais raccrocher.

### Pourquoi ici : le problème de fraîcheur des données

Le frontend utilise TanStack Query avec `staleTime` et
`refetchOnWindowFocus: false` — un utilisateur qui garde un onglet ouvert
peut donc regarder des données périmées pendant longtemps si un·e collègue
modifie la même ressource ailleurs. Plutôt que de faire du polling HTTP
(`GET` toutes les N secondes, gaspillage de requêtes la plupart du temps
inutiles), le serveur **pousse un signal** dès qu'une donnée change, et
seuls les clients concernés (ceux qui ont la permission de la voir)
reçoivent ce signal.

### Socket.IO / Engine.IO

On n'utilise pas l'API `WebSocket` brute du navigateur, mais **Socket.IO**
(`@nestjs/websockets` + `@nestjs/platform-socket.io` côté serveur), qui
ajoute par-dessus le protocole WebSocket :
- un **fallback automatique** en HTTP long-polling si le WebSocket est
  bloqué (proxy, entreprise, etc.) — c'est ce qu'on voit dans devtools sous
  forme de requêtes `GET /socket.io/?EIO=4&transport=polling` avant que la
  connexion bascule en WebSocket pur ;
- la reconnexion automatique ;
- le système de **rooms** (groupes de sockets auxquels on peut diffuser un
  message sans renvoyer à tout le monde) — c'est le mécanisme central de
  cette implémentation, voir §3.

---

## 2. Architecture générale

Un seul Gateway pour toute l'application :
[`StockRealtimeGateway`](../src/modules/commerce/realtime/stock-realtime.gateway.ts).
Il a été créé pour le module Stock (Commerce), puis étendu pour couvrir 10
modules métier supplémentaires plutôt que de dupliquer un Gateway par
module.

```
src/modules/commerce/realtime/
├── stock-realtime.gateway.ts   ← le Gateway (connexion, rooms, émission)
├── realtime.module.ts          ← module Nest exportant le Gateway
├── rooms.config.ts             ← table module → room → permission requise
└── events/
    ├── entity-changed.event.ts ← contrat de l'événement générique
    └── (stock-updated.event.ts vit dans src/modules/commerce/stocks/events/)
```

Le Gateway est enregistré une seule fois dans `RealtimeModule`, qui
l'exporte. Chaque module métier qui doit émettre un événement importe
`RealtimeModule` dans son `@Module({ imports: [...] })` et injecte
`StockRealtimeGateway` dans son service — exactement comme n'importe quel
autre provider Nest.

```ts
// realtime.module.ts
@Module({
  imports: [JwtModule, PrismaModule],
  providers: [WsAuthGuard, StockRealtimeGateway],
  exports: [StockRealtimeGateway],
})
export class RealtimeModule {}
```

---

## 3. Authentification de la connexion

Le système HTTP repose sur un cookie httpOnly `access_token` (JWT 15 min) +
vérification du hash bcrypt en base à chaque requête (pas de header
`Authorization`). Le canal WebSocket **rejoue exactement la même
vérification** via
[`WsAuthGuard`](../src/modules/auth/authentification/guards/ws-auth.guard.ts) :

1. Lire le cookie `access_token` depuis `client.handshake.headers.cookie`
   (le navigateur l'envoie automatiquement au handshake grâce à
   `withCredentials: true` côté client + `credentials: true` dans le CORS
   Socket.IO, cf. §6).
2. Vérifier la signature/expiration du JWT.
3. Recharger l'utilisateur en base et comparer le token au hash bcrypt
   stocké (`User.accessToken`) — un token révoqué (logout, désactivation)
   ne doit pas rester valide indéfiniment sur le canal WS alors qu'il l'est
   déjà côté HTTP.
4. Si le compte est désactivé/archivé → rejet.

Contrairement au HTTP, un Gateway Nest ne fait **pas** passer
automatiquement les guards sur `handleConnection` — c'est pour ça que
`WsAuthGuard.authenticate(client)` est appelé **manuellement** au tout début
de `handleConnection`, pas via `@UseGuards()`.

```ts
async handleConnection(@ConnectedSocket() client: Socket) {
  try {
    const user = await this.wsAuthGuard.authenticate(client);
    client.data.user = user;
    // ... rejoint les rooms (§4)
    this.scheduleExpiryDisconnect(client, user.exp);
  } catch (error) {
    client.disconnect(true); // cookie absent/invalide → socket refusé
  }
}
```

**Pas de refresh automatique sur le canal WS lui-même** : à l'expiration de
l'access_token (15 min), `scheduleExpiryDisconnect` programme une
déconnexion forcée du socket via `setTimeout`. Le frontend est responsable
de reconnecter le socket après qu'un `POST /auth/refresh` HTTP ait réussi
(déjà géré par l'intercepteur axios existant côté client).

---

## 4. Les rooms — qui reçoit quoi

Une **room** Socket.IO est juste un groupe nommé de sockets ; `server.to(room).emit(...)`
envoie l'événement uniquement aux sockets de ce groupe. Deux logiques
coexistent ici :

### 4.1 Room globale `stock-updates`

**Tous** les sockets authentifiés la rejoignent automatiquement à la
connexion, sans vérification de permission. Décision volontaire : échelle
modeste (back-office interne), le coût de diffuser la quantité de stock à
tout le monde est jugé négligeable face à la complexité d'un filtrage fin.

### 4.2 Rooms par module, filtrées par permission `:read`

Pour les modules ajoutés ensuite (certains sensibles : RBAC, salaires,
contrats), **chaque module a sa propre room**, rejointe **seulement** si le
socket a la permission `<module>:read` correspondante — même logique que
[`PermissionsGuard`](../src/modules/auth/authentification/guards/permissions.guard.ts)
côté HTTP (même requête Prisma : rôle → permissions → slugs).

Table complète — [`rooms.config.ts`](../src/modules/commerce/realtime/rooms.config.ts) :

| `module` | Room | Permission requise |
|---|---|---|
| `user` | `user-updates` | `user:read` |
| `role` | `role-updates` | `role:read` |
| `permission` | `permission-updates` | `permission:read` |
| `salessession` | `salessession-updates` | `salessession:read` |
| `absence` | `absence-updates` | `absence:read` |
| `contrat` | `contrat-updates` | `contrat:read` |
| `department` | `department-updates` | `department:read` |
| `rapport` | `rapport-updates` | `rapport:read` |
| `retard` | `retard-updates` | `retard:read` |
| `salaire` | `salaire-updates` | `salaire:read` |
| `article` | `article-updates` | `article:read` |
| `category` | `category-updates` | `category:read` |

> Ajout du 2026-07-30 : `article`/`category` avaient été oubliés de la liste
> initiale (le WebSocket stock ne couvre que `ArticleStock.quantiteActuelle`,
> pas le nom/description/prix de l'`Article`/`Category` eux-mêmes) — découvert
> en testant le renommage d'un article, qui ne se propageait pas.

**Bypass `Manage_system`** : un socket dont le rôle possède la permission
`Manage_system` (super admin) rejoint **toutes** les rooms d'un coup, même
bypass que `PermissionsGuard`.

```ts
private joinEntityRooms(client: Socket, permissionSlugs: string[]) {
  const hasFullAccess = permissionSlugs.includes(MANAGE_SYSTEM_SLUG);
  for (const { room, permission } of Object.values(ENTITY_ROOMS)) {
    if (hasFullAccess || permissionSlugs.includes(permission)) {
      client.join(room);
    }
  }
}
```

Les permissions sont chargées **une fois, à la connexion** (pas
re-vérifiées en continu) : si le rôle d'un utilisateur change pendant qu'il
est connecté, il faut qu'il se reconnecte (déconnexion/reconnexion du
socket) pour que les rooms soient recalculées. Ce n'est pas géré
automatiquement aujourd'hui.

---

## 5. Les deux événements

### 5.1 `stock.updated` — payload dénormalisé (module Stock uniquement)

Le tout premier événement implémenté, avant la généralisation. Porte des
données directement exploitables par l'UI (pas juste un signal) :

```ts
// src/modules/commerce/stocks/events/stock-updated.event.ts
interface StockUpdatedEvent {
  articleStockId: string;   // FK réelle du schéma Prisma (ArticleStock.id)
  quantite: number;
  niveauAlerte: TypeSeuil;  // 'NORMAL' | 'ALERTE' | 'CRITIQUE'
}
```

Émis vers la room globale `stock-updates` :

```ts
emitStockUpdated(event: StockUpdatedEvent) {
  this.server.to(STOCK_ROOM).emit('stock.updated', event);
}
```
  
### 5.2 `entity.changed` — signal générique (10 modules métier)

Recopier le pattern `stock.updated` (payload dédié) pour 10 modules aurait
obligé à maintenir 10 formats différents en plus des formats REST déjà
hétérogènes. Comme toutes les pages concernées utilisent déjà TanStack
Query avec `invalidateQueries`, elles n'ont besoin que d'un **signal**
(« va recharger tes données »), pas des nouvelles données elles-mêmes :

```ts
// src/modules/commerce/realtime/events/entity-changed.event.ts
type EntityModule =
  | 'user' | 'role' | 'permission' | 'salessession'
  | 'absence' | 'contrat' | 'department' | 'rapport' | 'retard' | 'salaire'
  | 'article' | 'category';

type EntityChangedAction = 'created' | 'updated' | 'deleted' | 'restored';

interface EntityChangedEvent {
  module: EntityModule;
  action: EntityChangedAction; // informatif — le frontend n'en a pas besoin en V1
  id?: string | number;        // si dispo facilement, sinon omis
}
```

Émis vers la room du module concerné (résolue via `ENTITY_ROOMS`) :

```ts
emitEntityChanged(event: EntityChangedEvent) {
  this.server.to(ENTITY_ROOMS[event.module].room).emit('entity.changed', event);
}
```

`salessession` émet **les deux événements** sur les mêmes routes
(`stock.updated` parce qu'une session ouvre/ferme touche le stock, et
`entity.changed` parce que la session elle-même a changé) — pas un doublon
fonctionnel, deux caches frontend différents à invalider.

---

## 6. Points d'émission — qui appelle quoi, où

Règle générale : **toute route qui écrit (POST/PATCH/PUT/DELETE) émet après
le commit réussi de sa transaction Prisma**, jamais avant (pour ne jamais
notifier un changement qui a finalement échoué/rollback). Le pattern
appliqué partout :

```ts
// AVANT (retournait directement le résultat de la transaction)
return this.prisma.$transaction(async (tx) => { ... });

// APRÈS (capture le résultat, émet, puis retourne)
const result = await this.prisma.$transaction(async (tx) => { ... });
this.realtimeGateway.emitEntityChanged({ module: 'xxx', action: 'yyy', id });
return result;
```

### Stock (`stock.updated`)

| Route | Service / méthode |
|---|---|
| `POST /movement-stock/mouvements` | `StockService` |
| `POST /sales-sessions/open-session` | `ServicesService.openSession` |
| `PATCH /sales-sessions/:id/close-session` | `ServicesService.closeSession` |
| `PATCH /sales-sessions/:id/cancel` | `ServicesService.cancelSession` |

### Les 10 modules (`entity.changed`)

| Module | Routes déclenchantes |
|---|---|
| `user` | `PATCH /users/:id`, `PATCH /users/archive/:id`, `PATCH /users/:id/restore` |
| `role` | `POST /roles`, `PATCH /roles/:id`, `PUT /roles/:id/permissions/sync`, `POST /roles/:id/permissions/add`, `POST /roles/:id/permissions/remove`, `DELETE /roles/:id` |
| `permission` | `POST /permissions`, `PATCH /permissions/:id`, `DELETE /permissions/:id` |
| `salessession` | `POST /sales-sessions/open-session`, `PATCH /sales-sessions/:id/close-session`, `PATCH /sales-sessions/:id/cancel` |
| `absence` | `POST /absences/jours`, `PATCH /absences/jour`, `DELETE /absences/jour` |
| `contrat` | `POST /contrats`, `PUT /contrats/:id`, `DELETE /contrats/:id`, `PATCH /contrats/:id/restore` |
| `department` | `POST /departments`, `PATCH /departments/:id`, `DELETE /departments/:id` |
| `rapport` | `POST /rapports/generer`, `DELETE /rapports/:id/supprimer`, `PATCH /rapports/:id/restore` |
| `retard` | `POST /retards/jours`, `PATCH /retards/jour`, `DELETE /retards/jour` |
| `salaire` | `POST /salaires/initialiser`, `PATCH /salaires/:id/primes`, `DELETE /salaires/:id/primes`, `POST /salaires/:id/cloturer`, `POST /salaires/:id/versements`, `POST /salaires/:id/fiche-de-paie` |
| `article` | `POST /articles/simple-create-article`, `POST /articles/create` (émet **aussi** `entity.changed` pour `category`, cf. note ci-dessous), `PATCH /articles/update/:id`, `PATCH /articles/soft-delete/:id`, `PATCH /articles/restore/:id`, `DELETE /articles/physical-delete/:id` |
| `category` | `POST /categories/create`, `PATCH /categories/update/:id`, `PATCH /categories/soft-delete/:id`, `PATCH /categories/restore-category/:id`, `DELETE /categories/delete/:id` |

> `POST /articles/create` (`ArticleService.createArticleWithCategory`) crée un
> `Article` **et** sa première `Category` (le premier format) dans la même
> transaction — ce n'est pas juste une écriture `article`. Elle émet donc les
> deux événements après commit : `emitEntityChanged({ module: 'article',
> action: 'created', id: articleId })` puis `emitEntityChanged({ module:
> 'category', action: 'created', id: categoryId })`. Même logique que
> `salessession` qui émet à la fois `entity.changed` et `stock.updated` — pas
> un doublon fonctionnel, deux rooms/caches différents à invalider.

---

## 7. CORS — piège du timing de chargement de `.env`

Le canal WebSocket a besoin de **sa propre config CORS**,
`app.enableCors()` (Express, côté REST) ne s'applique pas aux requêtes
`/socket.io/*` qui sont gérées directement par le moteur Engine.IO, pas par
le pipeline Express :

```ts
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
```

**Bug rencontré et corrigé** : cette configuration était présente mais
inopérante — `/socket.io/?EIO=4&transport=polling` ne renvoyait **aucun**
header CORS alors que `GET /api/v1/auth/me` les renvoyait correctement.

Cause : `process.env.FRONTEND_URL` valait `undefined` au moment où le
décorateur `@WebSocketGateway(...)` s'évaluait. Le décorateur d'une classe
s'exécute **à l'import** du fichier — et `import { AppModule } from
'./app.module'` (dans `main.ts`) charge en cascade tous les modules, y
compris le Gateway, **avant** que `ConfigModule.forRoot()` (appelé dans le
`@Module({...})` d'`AppModule` lui-même) n'ait eu l'occasion de charger
`.env`. Le CORS REST fonctionnait, lui, car `app.enableCors()` s'exécute au
runtime dans `bootstrap()`, bien après que `NestFactory.create()` ait déjà
instancié `ConfigModule`.

Correctif — charger `.env` en tout premier, avant tout autre import :

```ts
// src/main.ts — doit rester la toute première ligne
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
```

Vérifié après coup : `GET /socket.io/?EIO=4&transport=polling` avec
`Origin: http://localhost:5173` renvoie désormais
`Access-Control-Allow-Origin` + `Access-Control-Allow-Credentials: true`,
identique au comportement REST.

---

## 8. Ce qui n'est PAS fait (hors scope backend)

Le frontend (`NdoleCamFinal`) n'écoute pas encore ces événements. Prévu,
volontairement pas encore implémenté :

1. Dépendance `socket.io-client`.
2. `shared/lib/socket.ts` — instance socket unique, `withCredentials: true`,
   montée/démontée dans un provider proche de `QueryProvider`.
3. Un hook générique `useRealtimeInvalidation()` qui écoute `entity.changed`
   et appelle `queryClient.invalidateQueries` selon une table
   `module → queryKey(s)`, plus un hook dédié pour `stock.updated`
   (`useStockRealtimeSync()`) qui invalide les 3 caches stock existants.
4. Montage une seule fois globalement (`AppLayout`/`App.tsx`), pas par
   page, pour que l'invalidation fonctionne même si l'utilisateur n'a pas
   la page concernée ouverte au moment de l'événement.

---

## 9. Étendre à un nouveau module

1. Ajouter l'entrée dans `EntityModule` (`entity-changed.event.ts`) et dans
   `ENTITY_ROOMS` (`rooms.config.ts`) avec le nom de room et le slug de
   permission `:read`.
2. Importer `RealtimeModule` dans le `@Module({ imports: [...] })` du
   module concerné.
3. Injecter `StockRealtimeGateway` dans le service, et appeler
   `emitEntityChanged({ module, action, id })` après chaque transaction
   d'écriture réussie (pattern §6).

Aucun second Gateway à créer — tout passe par
`StockRealtimeGateway` (nom historique, jamais renommé pour limiter le
risque de casser les imports existants).
