export declare class StockDetailItem {
    stockId: string;
    format: string;
    prixUnite: number;
    quantite: number;
    niveauAlerte: string;
    valeurEstimee: number;
}
export declare class ArticleDetailResponseDto {
    id: string;
    nom: string;
    createdAt: Date;
    isArchived: boolean;
    archivedAt: Date | null;
    canMoveStock: boolean;
    detailsStock: StockDetailItem[];
    quantiteTotale: number;
}
