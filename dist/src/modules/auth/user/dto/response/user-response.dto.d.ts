export declare class UserMetaDto {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class PaginatedUserResponseDto {
    data: any[];
    meta: UserMetaDto;
}
