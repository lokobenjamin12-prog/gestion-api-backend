import { ArticleItemResponseDto } from "./article-item-response-dto";
declare class PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class GetArticlesResponseDto {
    data: ArticleItemResponseDto[];
    meta: PaginationMeta;
}
export {};
