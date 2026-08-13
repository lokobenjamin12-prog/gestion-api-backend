import { AuthModule, LogLevel, Reason, State } from '@prisma/client';
export declare class AuthLogFiltersDto {
    page?: number;
    limit?: number;
    actorId?: string;
    module?: AuthModule;
    action?: string;
    level?: LogLevel;
    state?: State;
    reason?: Reason;
    email?: string;
    dateDebut?: string;
    dateFin?: string;
}
