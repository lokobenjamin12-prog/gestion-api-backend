export declare enum ArticleStatusFilter {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
    ALL = "ALL"
}
export declare class GetArticlesQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: ArticleStatusFilter;
}
