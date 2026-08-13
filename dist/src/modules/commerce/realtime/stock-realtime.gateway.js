"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StockRealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockRealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const ws_auth_guard_1 = require("../../auth/authentification/guards/ws-auth.guard");
const prisma_service_1 = require("../../../prisma/prisma.service");
const rooms_config_1 = require("./rooms.config");
const STOCK_ROOM = 'stock-updates';
let StockRealtimeGateway = StockRealtimeGateway_1 = class StockRealtimeGateway {
    wsAuthGuard;
    prisma;
    server;
    logger = new common_1.Logger(StockRealtimeGateway_1.name);
    expiryTimers = new Map();
    constructor(wsAuthGuard, prisma) {
        this.wsAuthGuard = wsAuthGuard;
        this.prisma = prisma;
    }
    async handleConnection(client) {
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`❌ Connexion WS rejetée (${client.id}) : ${message}`);
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        const timer = this.expiryTimers.get(client.id);
        if (timer) {
            clearTimeout(timer);
            this.expiryTimers.delete(client.id);
        }
        this.logger.log(`🔌 Socket déconnecté : ${client.id}`);
    }
    emitStockUpdated(event) {
        this.server.to(STOCK_ROOM).emit('stock.updated', event);
    }
    emitEntityChanged(event) {
        this.server.to(rooms_config_1.ENTITY_ROOMS[event.module].room).emit('entity.changed', event);
    }
    async loadPermissionSlugs(nomrole) {
        const role = await this.prisma.role.findUnique({
            where: { nomRole: nomrole },
            include: { permissions: { include: { permission: true } } },
        });
        return role?.permissions.map((rp) => rp.permission.slug) ?? [];
    }
    joinEntityRooms(client, permissionSlugs) {
        const hasFullAccess = permissionSlugs.includes(rooms_config_1.MANAGE_SYSTEM_SLUG);
        for (const { room, permission } of Object.values(rooms_config_1.ENTITY_ROOMS)) {
            if (hasFullAccess || permissionSlugs.includes(permission)) {
                client.join(room);
            }
        }
    }
    scheduleExpiryDisconnect(client, exp) {
        if (!exp)
            return;
        const msUntilExpiry = exp * 1000 - Date.now();
        const timer = setTimeout(() => {
            this.logger.log(`⏰ Access token expiré — déconnexion du socket ${client.id}`);
            client.disconnect(true);
        }, Math.max(msUntilExpiry, 0));
        this.expiryTimers.set(client.id, timer);
    }
};
exports.StockRealtimeGateway = StockRealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], StockRealtimeGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], StockRealtimeGateway.prototype, "handleConnection", null);
exports.StockRealtimeGateway = StockRealtimeGateway = StockRealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [ws_auth_guard_1.WsAuthGuard,
        prisma_service_1.PrismaService])
], StockRealtimeGateway);
//# sourceMappingURL=stock-realtime.gateway.js.map