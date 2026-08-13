export declare class MovementItemDto {
    id: string;
    type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';
    quantite: number;
    avant: number;
    apres: number;
    motif: string;
    date: Date;
    isSystem: boolean;
    articleId: string;
    articleNom: string;
    categoryNom: string;
    auteur: string;
}
export declare class MovementHistoryResponseDto {
    data: MovementItemDto[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}
