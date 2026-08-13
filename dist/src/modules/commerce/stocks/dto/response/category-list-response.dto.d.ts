export declare class CategoryItemDto {
    id: string;
    nomUnique: string;
    prixUnite: number;
    description: string | null;
    quantiteDisponible: number;
    alerte: string;
    article: {
        id: string;
        nom: string;
    };
}
export declare class PaginatedCategoryResponseDto {
    data: CategoryItemDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
