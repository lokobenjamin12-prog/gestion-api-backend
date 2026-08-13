import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from 'src/modules/auth/authentification/guards/ws-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockUpdatedEvent } from '../stocks/events/stock-updated.event';
import { EntityChangedEvent } from './events/entity-changed.event';
import { ENTITY_ROOMS, MANAGE_SYSTEM_SLUG } from './rooms.config';

// Échelle modeste (back-office interne) : une seule room globale suffit, pas besoin de
// distinguer par article/catégorie ni d'adaptateur Redis multi-instance pour l'instant.
const STOCK_ROOM = 'stock-updates';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class StockRealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(StockRealtimeGateway.name);
  private readonly expiryTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly wsAuthGuard: WsAuthGuard,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const user = await this.wsAuthGuard.authenticate(client);
      client.data.user = user;
      client.join(STOCK_ROOM);

      const permissionSlugs = await this.loadPermissionSlugs(user.nomrole);
      this.joinEntityRooms(client, permissionSlugs);

      console.log('[DEBUG entity-rooms] user.nomrole =', user.nomrole);
      console.log('[DEBUG entity-rooms] permissionSlugs =', permissionSlugs);
      console.log('[DEBUG entity-rooms] client.rooms =', [...client.rooms]);

      this.logger.log(`🔌 Socket authentifié : ${user.email} (${client.id})`);
      this.scheduleExpiryDisconnect(client, user.exp);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`❌ Connexion WS rejetée (${client.id}) : ${message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const timer = this.expiryTimers.get(client.id);
    if (timer) {
      clearTimeout(timer);
      this.expiryTimers.delete(client.id);
    }
    this.logger.log(`🔌 Socket déconnecté : ${client.id}`);
  }

  emitStockUpdated(event: StockUpdatedEvent) {
    this.server.to(STOCK_ROOM).emit('stock.updated', event);
  }

  emitEntityChanged(event: EntityChangedEvent) {
    this.server.to(ENTITY_ROOMS[event.module].room).emit('entity.changed', event);
  }

  // Même requête que PermissionsGuard (HTTP) : rôle → permissions → slugs.
  private async loadPermissionSlugs(nomrole: string): Promise<string[]> {
    const role = await this.prisma.role.findUnique({
      where: { nomRole: nomrole },
      include: { permissions: { include: { permission: true } } },
    });

    return role?.permissions.map((rp) => rp.permission.slug) ?? [];
  }

  private joinEntityRooms(client: Socket, permissionSlugs: string[]) {
    const hasFullAccess = permissionSlugs.includes(MANAGE_SYSTEM_SLUG);

    for (const { room, permission } of Object.values(ENTITY_ROOMS)) {
      if (hasFullAccess || permissionSlugs.includes(permission)) {
        client.join(room);
      }
    }
  }

  // Pas de refresh automatique sur le canal WS : à l'expiration de l'access_token (15 min),
  // on déconnecte le socket. Le frontend le reconnectera après un POST /auth/refresh réussi.
  private scheduleExpiryDisconnect(client: Socket, exp?: number) {
    if (!exp) return;

    const msUntilExpiry = exp * 1000 - Date.now();
    const timer = setTimeout(() => {
      this.logger.log(`⏰ Access token expiré — déconnexion du socket ${client.id}`);
      client.disconnect(true);
    }, Math.max(msUntilExpiry, 0));

    this.expiryTimers.set(client.id, timer);
  }
}
