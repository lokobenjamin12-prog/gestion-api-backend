import { AuthLogService } from './auth-log.service';
import { AuthLogFiltersDto } from './dto/auth-log-filters.dto';
import { AuthModule } from '@prisma/client';
export declare class AuthLogController {
    private readonly authLog;
    constructor(authLog: AuthLogService);
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
}
