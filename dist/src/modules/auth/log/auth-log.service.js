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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthLogService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AuthLogService = class AuthLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(entry, tx) {
        const client = tx ?? this.prisma;
        await client.authLog.create({
            data: {
                actorId: entry.actorId ?? null,
                actorName: entry.actorName ?? null,
                module: entry.module,
                action: entry.action,
                level: entry.level ?? client_1.LogLevel.INFO,
                entityId: entry.entityId ?? null,
                entityName: entry.entityName ?? null,
                valeurAvant: entry.avant ? JSON.stringify(entry.avant) : null,
                valeurApres: entry.apres ? JSON.stringify(entry.apres) : null,
                state: entry.state ?? client_1.State.SUCCESS,
                reason: entry.reason ?? null,
                message: entry.message,
                email: entry.email ?? null,
            },
        });
    }
    async findAll(filters) {
        const { page = 1, limit = 20, actorId, module, action, level, state, reason, email, dateDebut, dateFin, } = filters;
        const skip = (page - 1) * limit;
        const where = {
            ...(actorId && { actorId }),
            ...(module && { module }),
            ...(action && { action: { contains: action, mode: 'insensitive' } }),
            ...(level && { level }),
            ...(state && { state }),
            ...(reason && { reason }),
            ...(email && { email: { contains: email, mode: 'insensitive' } }),
            ...(dateDebut || dateFin
                ? {
                    createdAt: {
                        ...(dateDebut && { gte: new Date(dateDebut) }),
                        ...(dateFin && { lte: new Date(dateFin) }),
                    },
                }
                : {}),
        };
        const [total, data] = await Promise.all([
            this.prisma.authLog.count({ where }),
            this.prisma.authLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    actorId: true,
                    actorName: true,
                    module: true,
                    action: true,
                    level: true,
                    entityId: true,
                    entityName: true,
                    state: true,
                    reason: true,
                    message: true,
                    email: true,
                    createdAt: true,
                },
            }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id) {
        const log = await this.prisma.authLog.findUnique({
            where: { id },
            include: {
                actor: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
        if (!log) {
            throw new common_1.NotFoundException(`Log auth #${id} introuvable`);
        }
        return log;
    }
    async findByActor(actorId, filters) {
        return this.findAll({ ...filters, actorId });
    }
    async findByModule(module, filters) {
        return this.findAll({ ...filters, module });
    }
    async getStats() {
        const [total, parLevel, parModule, parState] = await Promise.all([
            this.prisma.authLog.count(),
            this.prisma.authLog.groupBy({
                by: ['level'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            }),
            this.prisma.authLog.groupBy({
                by: ['module'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            }),
            this.prisma.authLog.groupBy({
                by: ['state'],
                _count: { id: true },
            }),
        ]);
        return {
            total,
            parLevel: parLevel.map(r => ({ level: r.level, count: r._count.id })),
            parModule: parModule.map(r => ({ module: r.module, count: r._count.id })),
            parState: parState.map(r => ({ state: r.state, count: r._count.id })),
        };
    }
    async info(entry, tx) {
        return this.log({ ...entry, level: client_1.LogLevel.INFO }, tx);
    }
    async warn(entry, tx) {
        return this.log({ ...entry, level: client_1.LogLevel.WARNING }, tx);
    }
    async error(entry, tx) {
        return this.log({ ...entry, level: client_1.LogLevel.ERROR }, tx);
    }
    async critical(entry, tx) {
        return this.log({ ...entry, level: client_1.LogLevel.CRITICAL }, tx);
    }
    async resolveActorName(actorId) {
        const user = await this.prisma.user.findUnique({
            where: { id: actorId },
            select: { firstName: true, lastName: true },
        });
        if (!user)
            return 'Inconnu';
        return `${user.firstName} ${user.lastName}`.trim();
    }
};
exports.AuthLogService = AuthLogService;
exports.AuthLogService = AuthLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthLogService);
//# sourceMappingURL=auth-log.service.js.map