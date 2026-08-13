import { TypeMouvement, TypeSeuil } from "@prisma/client";

export interface MovementResult {
    movement: {
        id: string;
        type: TypeMouvement;
        quantiteSortieOuEntree: number;
        movementDate: Date;
    };
    stock: {
        articleId: string;
        nomArticle: string;
        categorie: string;
        prixUnite: number;
        quantiteAvant: number;
        quantiteApres: number;
        niveauAvant: TypeSeuil;
        niveauApres: TypeSeuil;
        niveauChange: boolean;
        valeurStock: number;    // quantiteApres × prixUnite
    };
    alerte: {
        active: boolean;
        niveau: TypeSeuil;
        message: string;
    };
}

