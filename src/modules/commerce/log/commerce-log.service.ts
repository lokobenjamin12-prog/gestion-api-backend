import { Injectable, NotFoundException } from '@nestjs/common';
import { CommerceModule, LogLevel, Prisma, State } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommerceLogFiltersDto } from './dto/commerce-log-filters.dto';

export interface CommerceLogEntry {
    actorId: string;
    actorName: string;
    module: CommerceModule;
    action: string;
    level?: LogLevel;
    entityId?: string;
    entityName?: string;
    avant?: object;
    apres?: object;
    state?: State;
    message: string;
}

@Injectable()
export class CommerceLogService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Core log method ──────────────────────────────────────────────────────
    async log(
        entry: CommerceLogEntry,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        const client = tx ?? this.prisma;

        await client.commerceLog.create({
            data: {
                actorId: entry.actorId,
                actorName: entry.actorName,
                module: entry.module,
                action: entry.action,
                level: entry.level ?? LogLevel.INFO,
                entityId: entry.entityId,
                entityName: entry.entityName,
                valeurAvant: entry.avant ? JSON.stringify(entry.avant) : null,
                valeurApres: entry.apres ? JSON.stringify(entry.apres) : null,
                state: entry.state ?? State.SUCCESS,
                message: entry.message,
            },
        });
    }

    // ─── Shorthand helpers ────────────────────────────────────────────────────
    async info(entry: Omit<CommerceLogEntry, 'level'>, tx?: Prisma.TransactionClient) {
        return this.log({ ...entry, level: LogLevel.INFO }, tx);
    }

    async warn(entry: Omit<CommerceLogEntry, 'level'>, tx?: Prisma.TransactionClient) {
        return this.log({ ...entry, level: LogLevel.WARNING }, tx);
    }

    async error(entry: Omit<CommerceLogEntry, 'level'>, tx?: Prisma.TransactionClient) {
        return this.log({ ...entry, level: LogLevel.ERROR }, tx);
    }

    async critical(entry: Omit<CommerceLogEntry, 'level'>, tx?: Prisma.TransactionClient) {
        return this.log({ ...entry, level: LogLevel.CRITICAL }, tx);
    }

    // ─── Actor name resolver ──────────────────────────────────────────────────
    async resolveActorName(actorId: string): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { id: actorId },
            select: { firstName: true, lastName: true },
        });
        if (!user) return 'Inconnu';
        return `${user.firstName} ${user.lastName}`.trim();
    }



    // ─── Find All ─────────────────────────────────────────────────────────────
    async findAll(filters: CommerceLogFiltersDto) {
        const {
            page = 1,
            limit = 20,
            actorId,
            module,
            action,
            level,
            state,
            entityId,
            dateDebut,
            dateFin,
        } = filters;

        const skip = (page - 1) * limit;

        const where: Prisma.CommerceLogWhereInput = {
            ...(actorId && { actorId }),
            ...(module && { module }),
            ...(action && { action: { contains: action, mode: 'insensitive' } }),
            ...(level && { level }),
            ...(state && { state }),
            ...(entityId && { entityId }),
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
            this.prisma.commerceLog.count({ where }),
            this.prisma.commerceLog.findMany({
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
                    message: true,
                    createdAt: true,
                    // valeurAvant/valeurApres exclus du listing
                    // disponibles uniquement dans findOne
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

    // ─── Find One ─────────────────────────────────────────────────────────────
    async findOne(id: string) {
        const log = await this.prisma.commerceLog.findUnique({
            where: { id },
            include: {
                actor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!log) {
            throw new NotFoundException(`Log Commerce #${id} introuvable`);
        }

        return log;
    }

    // ─── Find By Actor ────────────────────────────────────────────────────────
    async findByActor(actorId: string, filters: CommerceLogFiltersDto) {
        return this.findAll({ ...filters, actorId });
    }

    // ─── Stats ────────────────────────────────────────────────────────────────
    async getStats() {
        const [total, parLevel, parModule, parState] = await Promise.all([
            this.prisma.commerceLog.count(),

            this.prisma.commerceLog.groupBy({
                by: ['level'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            }),

            this.prisma.commerceLog.groupBy({
                by: ['module'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            }),

            this.prisma.commerceLog.groupBy({
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
}