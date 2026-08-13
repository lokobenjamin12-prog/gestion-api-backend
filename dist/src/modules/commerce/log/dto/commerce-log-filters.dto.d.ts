import { CommerceModule, LogLevel, State } from '@prisma/client';
export declare class CommerceLogFiltersDto {
    page?: number;
    limit?: number;
    actorId?: string;
    module?: CommerceModule;
    action?: string;
    level?: LogLevel;
    state?: State;
    entityId?: string;
    dateDebut?: string;
    dateFin?: string;
}
