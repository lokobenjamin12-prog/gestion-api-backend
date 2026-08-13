import { AuthModule, LogLevel, Prisma, Reason, State } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthLogFiltersDto } from './dto/auth-log-filters.dto';
export interface AuthLogEntry {
    actorId?: string;
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
    email?: string;
}
export declare class AuthLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(entry: AuthLogEntry, tx?: Prisma.TransactionClient): Promise<void>;
    findAll(filters: AuthLogFiltersDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            email: string | null;
            message: string;
            reason: import("@prisma/client").$Enums.Reason | null;
            action: string;
            module: import("@prisma/client").$Enums.AuthModule;
            state: import("@prisma/client").$Enums.State;
            actorId: string | null;
            level: import("@prisma/client").$Enums.LogLevel;
            actorName: string | null;
            entityId: string | null;
            entityName: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findOne(id: string): Promise<{
        actor: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        email: string | null;
        message: string;
        reason: import("@prisma/client").$Enums.Reason | null;
        action: string;
        module: import("@prisma/client").$Enums.AuthModule;
        state: import("@prisma/client").$Enums.State;
        actorId: string | null;
        level: import("@prisma/client").$Enums.LogLevel;
        actorName: string | null;
        entityId: string | null;
        entityName: string | null;
        valeurAvant: string | null;
        valeurApres: string | null;
    }>;
    findByActor(actorId: string, filters: AuthLogFiltersDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            email: string | null;
            message: string;
            reason: import("@prisma/client").$Enums.Reason | null;
            action: string;
            module: import("@prisma/client").$Enums.AuthModule;
            state: import("@prisma/client").$Enums.State;
            actorId: string | null;
            level: import("@prisma/client").$Enums.LogLevel;
            actorName: string | null;
            entityId: string | null;
            entityName: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findByModule(module: AuthModule, filters: AuthLogFiltersDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            email: string | null;
            message: string;
            reason: import("@prisma/client").$Enums.Reason | null;
            action: string;
            module: import("@prisma/client").$Enums.AuthModule;
            state: import("@prisma/client").$Enums.State;
            actorId: string | null;
            level: import("@prisma/client").$Enums.LogLevel;
            actorName: string | null;
            entityId: string | null;
            entityName: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    getStats(): Promise<{
        total: number;
        parLevel: {
            level: import("@prisma/client").$Enums.LogLevel;
            count: number;
        }[];
        parModule: {
            module: import("@prisma/client").$Enums.AuthModule;
            count: number;
        }[];
        parState: {
            state: import("@prisma/client").$Enums.State;
            count: number;
        }[];
    }>;
    info(entry: Omit<AuthLogEntry, 'level'>, tx?: Prisma.TransactionClient): Promise<void>;
    warn(entry: Omit<AuthLogEntry, 'level'>, tx?: Prisma.TransactionClient): Promise<void>;
    error(entry: Omit<AuthLogEntry, 'level'>, tx?: Prisma.TransactionClient): Promise<void>;
    critical(entry: Omit<AuthLogEntry, 'level'>, tx?: Prisma.TransactionClient): Promise<void>;
    resolveActorName(actorId: string): Promise<string>;
}
