import { SessionStatus } from '@prisma/client';
export declare class GetSessionsFilterDto {
    status?: SessionStatus;
    jourOuverture?: string;
    page?: number;
    limit?: number;
}
