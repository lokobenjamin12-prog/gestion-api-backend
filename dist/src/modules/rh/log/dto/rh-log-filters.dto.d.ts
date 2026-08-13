import { RhModule, LogLevel, State } from '@prisma/client';
export declare class RhLogFiltersDto {
    page?: number;
    limit?: number;
    actorId?: string;
    module?: RhModule;
    action?: string;
    level?: LogLevel;
    state?: State;
    entityId?: string;
    dateDebut?: string;
    dateFin?: string;
}
