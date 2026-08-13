declare class StockAlerteStyleDto {
    label: string;
    color: string;
    message: string;
}
export declare class StockOverviewItemDto {
    stockId: string;
    nomArticle: string;
    categoryNom: string;
    prixUnitaireCategory: number;
    quantite: number;
    niveauAlerte: 'NORMAL' | 'LOW' | 'CRITICAL';
    valeurStock: number;
    alerte: StockAlerteStyleDto;
}
export {};
