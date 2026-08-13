export declare class CategoryDetailResponseDto {
    id: string;
    nomFormat: string;
    description: string | null;
    prixUnite: number;
    article: {
        nom: string;
    };
    stock: {
        id: string;
        quantiteActuelle: number;
        niveauAlerte: string;
    } | null;
}
