export declare class SessionSummaryDto {
    id: string;
    commercial: {
        id: string;
        profilePicture: string;
        firstName: string;
        lastName: string;
    };
    manager: {
        id: string;
        profilePicture: string;
        firstName: string;
        lastName: string;
    };
    article: {
        nom: string;
        categorie: string;
        prixUnite: number;
    };
    quantiteDepart: number;
    quantiteRetour: number | null;
    quantiteVendue: number | null;
    jourOuverture: string;
    heureDepart: Date;
    heureRetour: Date | null;
    totalVentesRecues: number | null;
    totalDepenses: number;
    depenses: any[];
    chiffreAffaireTheorique: number | null;
    ecartCaisse: number | null;
    status: string;
}
