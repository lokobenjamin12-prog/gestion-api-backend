import { LogLevel, State } from '@prisma/client';
export declare class LogQueryFiltersDto {
    page?: number;
    limit?: number;
    actorId?: string;
    level?: LogLevel;
    state?: State;
    dateDebut?: string;
    dateFin?: string;
}
