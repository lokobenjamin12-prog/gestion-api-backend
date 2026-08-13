import { AuthLogService } from '../auth/log/auth-log.service';
import { CommerceLogService } from '../commerce/log/commerce-log.service';
import { RhLogService } from '../rh/log/rh-log.service';
import { LogQueryFiltersDto } from './dto/log-query-filters.dto';
export interface LogSubModuleSummary {
    key: string;
    label: string;
    path: string;
    total: number;
}
export declare class LogService {
    private readonly authLog;
    private readonly commerceLog;
    private readonly rhLog;
    constructor(authLog: AuthLogService, commerceLog: CommerceLogService, rhLog: RhLogService);
    articles(filters: LogQueryFiltersDto): Promise<{
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
    categories(filters: LogQueryFiltersDto): Promise<{
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
    mouvementsStock(filters: LogQueryFiltersDto): Promise<{
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
    salesSession(filters: LogQueryFiltersDto): Promise<{
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
    private stockFilters;
    authentification(filters: LogQueryFiltersDto): Promise<{
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
    permissions(filters: LogQueryFiltersDto): Promise<{
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
    roles(filters: LogQueryFiltersDto): Promise<{
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
    users(filters: LogQueryFiltersDto): Promise<{
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
    absences(filters: LogQueryFiltersDto): Promise<{
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
    contrats(filters: LogQueryFiltersDto): Promise<{
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
    departements(filters: LogQueryFiltersDto): Promise<{
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
    rapports(filters: LogQueryFiltersDto): Promise<{
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
    retards(filters: LogQueryFiltersDto): Promise<{
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
    salaires(filters: LogQueryFiltersDto): Promise<{
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
    private get subModuleDefinitions();
    getOverview(): Promise<LogSubModuleSummary[]>;
    getGlobalStats(): Promise<{
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
}
