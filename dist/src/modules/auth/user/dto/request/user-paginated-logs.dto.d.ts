export declare class LogResponseDto {
    id: string;
    action: string;
    module: string;
    message: string;
    state: string;
    createdAt: Date;
}
declare class PaginationMetaDto {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class PaginatedLogsDto {
    data: LogResponseDto[];
    meta: PaginationMetaDto;
}
export {};
