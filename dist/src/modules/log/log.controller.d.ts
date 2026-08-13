import { LogService } from './log.service';
import { LogQueryFiltersDto } from './dto/log-query-filters.dto';
export declare class LogController {
    private readonly logService;
    constructor(logService: LogService);
    getOverview(): Promise<import("./log.service").LogSubModuleSummary[]>;
    getStats(): Promise<{
        total: number;
        authentification: {
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
        };
        commerce: {
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
        };
        rh: {
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
        };
    }>;
    getArticles(filters: LogQueryFiltersDto): Promise<{
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
    getCategories(filters: LogQueryFiltersDto): Promise<{
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
    getMouvementsStock(filters: LogQueryFiltersDto): Promise<{
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
    getSalesSession(filters: LogQueryFiltersDto): Promise<{
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
    getAuthentification(filters: LogQueryFiltersDto): Promise<{
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
    getPermissions(filters: LogQueryFiltersDto): Promise<{
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
    getRoles(filters: LogQueryFiltersDto): Promise<{
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
    getUsers(filters: LogQueryFiltersDto): Promise<{
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
    getAbsences(filters: LogQueryFiltersDto): Promise<{
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
    getContrats(filters: LogQueryFiltersDto): Promise<{
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
    getDepartements(filters: LogQueryFiltersDto): Promise<{
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
    getRapports(filters: LogQueryFiltersDto): Promise<{
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
    getRetards(filters: LogQueryFiltersDto): Promise<{
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
    getSalaires(filters: LogQueryFiltersDto): Promise<{
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
}
