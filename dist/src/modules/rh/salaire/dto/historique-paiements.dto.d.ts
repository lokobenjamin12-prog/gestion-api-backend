export declare class HistoriquePaiementsDto {
    page?: number;
    limit?: number;
    annee?: number;
    mois?: number;
    montantMinimum?: number;
    montantMaximum?: number;
    avecEcart?: boolean;
    avecFiche?: boolean;
    ficheSigne?: boolean;
    dateClotureDebut?: string;
    dateClotureFin?: string;
}
