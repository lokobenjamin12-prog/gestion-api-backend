import { CommerceLogService } from './commerce-log.service';
import { CommerceLogFiltersDto } from './dto/commerce-log-filters.dto';
export declare class CommerceLogController {
    private readonly commerceLog;
    constructor(commerceLog: CommerceLogService);
    findAll(filters: CommerceLogFiltersDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            message: string;
            action: string;
            module: import("@prisma/client").$Enums.CommerceModule;
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
            module: import("@prisma/client").$Enums.CommerceModule;
            count: number;
        }[];
        parState: {
            state: import("@prisma/client").$Enums.State;
            count: number;
        }[];
    }>;
    findByActor(actorId: string, filters: CommerceLogFiltersDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            message: string;
            action: string;
            module: import("@prisma/client").$Enums.CommerceModule;
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
        module: import("@prisma/client").$Enums.CommerceModule;
        state: import("@prisma/client").$Enums.State;
        actorId: string;
        level: import("@prisma/client").$Enums.LogLevel;
        actorName: string;
        entityId: string | null;
        entityName: string | null;
        valeurAvant: string | null;
        valeurApres: string | null;
    }>;
}
