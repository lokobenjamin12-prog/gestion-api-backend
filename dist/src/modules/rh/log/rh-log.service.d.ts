import { LogLevel, Prisma, RhModule, State } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RhLogFiltersDto } from './dto/rh-log-filters.dto';
export interface RhLogEntry {
    actorId: string;
    actorName: string;
    module: RhModule;
    action: string;
    level?: LogLevel;
    entityId?: string;
    entityName?: string;
    avant?: object;
    apres?: object;
    state?: State;
    message: string;
}
export declare class RhLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(entry: RhLogEntry, tx?: Prisma.TransactionClient): Promise<void>;
    info(entry: Omit<RhLogEntry, 'level'>, tx?: Prisma.TransactionClient): Promise<void>;
    warn(entry: Omit<RhLogEntry, 'level'>, tx?: Prisma.TransactionClient): Promise<void>;
    error(entry: Omit<RhLogEntry, 'level'>, tx?: Prisma.TransactionClient): Promise<void>;
    critical(entry: Omit<RhLogEntry, 'level'>, tx?: Prisma.TransactionClient): Promise<void>;
    resolveActorName(actorId: string): Promise<string>;
    findAll(filters: RhLogFiltersDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            message: string;
            action: string;
            module: import("@prisma/client").$Enums.RhModule;
            state: import("@prisma/client").$Enums.State;
            actorId: string;
            level: import("@prisma/client").$Enums.LogLevel;
            actorName: string;
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
        };
    } & {
        id: string;
        createdAt: Date;
        message: string;
        action: string;
        module: import("@prisma/client").$Enums.RhModule;
        state: import("@prisma/client").$Enums.State;
        actorId: string;
        level: import("@prisma/client").$Enums.LogLevel;
        actorName: string;
        entityId: string | null;
        entityName: string | null;
        valeurAvant: string | null;
        valeurApres: string | null;
    }>;
    findByActor(actorId: string, filters: RhLogFiltersDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            message: string;
            action: string;
            module: import("@prisma/client").$Enums.RhModule;
            state: import("@prisma/client").$Enums.State;
            actorId: string;
            level: import("@prisma/client").$Enums.LogLevel;
            actorName: string;
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
            module: import("@prisma/client").$Enums.RhModule;
            count: number;
        }[];
        parState: {
            state: import("@prisma/client").$Enums.State;
            count: number;
        }[];
    }>;
}
