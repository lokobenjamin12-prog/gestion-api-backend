import { SessionSummaryDto } from "./session-response.dto";
export declare class PaginationMetaDto {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class PaginatedSessionsResponseDto {
    data: SessionSummaryDto[];
    meta: PaginationMetaDto;
}
