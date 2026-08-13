import { RhLogService } from './rh-log.service';
import { RhLogFiltersDto } from './dto/rh-log-filters.dto';
export declare class RhLogController {
    private readonly rhLog;
    constructor(rhLog: RhLogService);
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
}
