import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from 'src/modules/auth/authentification/guards/ws-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockUpdatedEvent } from '../stocks/events/stock-updated.event';
import { EntityChangedEvent } from './events/entity-changed.event';
export declare class StockRealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly wsAuthGuard;
    private readonly prisma;
    server: Server;
    private readonly logger;
    private readonly expiryTimers;
    constructor(wsAuthGuard: WsAuthGuard, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    emitStockUpdated(event: StockUpdatedEvent): void;
    emitEntityChanged(event: EntityChangedEvent): void;
    private loadPermissionSlugs;
    private joinEntityRooms;
    private scheduleExpiryDisconnect;
}
