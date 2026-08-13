import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthModule, LogLevel, Prisma, Reason, State } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthLogFiltersDto } from './dto/auth-log-filters.dto';

export interface AuthLogEntry {
    actorId?: string;       // optional — unknown user on failed login
    actorName?: string;
    module: AuthModule;
    action: string;
    level?: LogLevel;
    entityId?: string;
    entityName?: string;
    avant?: object;
    apres?: object;
    state?: State;
    reason?: Reason;
    message: string;
    email?: string;         // extra context for auth events
}

@Injectable()
export class AuthLogService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Core log method ──────────────────────────────────────────────────────
    async log(
        entry: AuthLogEntry,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        const client = tx ?? this.prisma;

        await client.authLog.create({
            data: {
                actorId: entry.actorId ?? null,
                actorName: entry.actorName ?? null,
                module: entry.module,
                action: entry.action,
                level: entry.level ?? LogLevel.INFO,
                entityId: entry.entityId ?? null,
                entityName: entry.entityName ?? null,
                valeurAvant: entry.avant ? JSON.stringify(entry.avant) : null,
                valeurApres: entry.apres ? JSON.stringify(entry.apres) : null,
                state: entry.state ?? State.SUCCESS,
                reason: entry.reason ?? null,
                message: entry.message,
                email: entry.email ?? null,
            },
        });
    }


    // ─── Find All ─────────────────────────────────────────────────────────────
    async findAll(filters: AuthLogFiltersDto) {
        const {
            page = 1,
            limit = 20,
            actorId,
            module,
            action,
            level,
            state,
            reason,
            email,
            dateDebut,
            dateFin,
        } = filters;

        const skip = (page - 1) * limit;

        // Construction dynamique du filtre WHERE
        const where: Prisma.AuthLogWhereInput = {
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
                    // On exclut valeurAvant/valeurApres du listing pour alléger la réponse
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
        const log = await this.prisma.authLog.findUnique({
            where: { id },
            include: {
                actor: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });

        if (!log) {
            throw new NotFoundException(`Log auth #${id} introuvable`);
        }

        return log;
    }

    // ─── Find By Actor ────────────────────────────────────────────────────────
    async findByActor(actorId: string, filters: AuthLogFiltersDto) {
        return this.findAll({ ...filters, actorId });
    }

    // ─── Find By Module ───────────────────────────────────────────────────────
    async findByModule(module: AuthModule, filters: AuthLogFiltersDto) {
        return this.findAll({ ...filters, module });
    }

    // ─── Stats rapides ────────────────────────────────────────────────────────
    async getStats() {
        const [total, parLevel, parModule, parState] = await Promise.all([
            this.prisma.authLog.count(),

            // Répartition par niveau
            this.prisma.authLog.groupBy({
                by: ['level'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            }),

            // Répartition par module
            this.prisma.authLog.groupBy({
                by: ['module'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            }),

            // Répartition par état
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




    // ─── Shorthand helpers ────────────────────────────────────────────────────
    async info(entry: Omit<AuthLogEntry, 'level'>, tx?: Prisma.TransactionClient) {
        return this.log({ ...entry, level: LogLevel.INFO }, tx);
    }

    async warn(entry: Omit<AuthLogEntry, 'level'>, tx?: Prisma.TransactionClient) {
        return this.log({ ...entry, level: LogLevel.WARNING }, tx);
    }

    async error(entry: Omit<AuthLogEntry, 'level'>, tx?: Prisma.TransactionClient) {
        return this.log({ ...entry, level: LogLevel.ERROR }, tx);
    }

    async critical(entry: Omit<AuthLogEntry, 'level'>, tx?: Prisma.TransactionClient) {
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
}