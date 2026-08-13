import { ApiProperty } from '@nestjs/swagger';

export class CategoryDetailResponseDto {
    @ApiProperty({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique de la catégorie ou du format de conditionnement'
    })
    id: string;

    @ApiProperty({
        example: 'Carton',
        description: 'Nom unique du format de conditionnement (ex: Carton, Sachet, Douzaine)'
    })
    nomFormat: string;

    @ApiProperty({
        example: 'Emballage renforcé contenant 24 unités de produit, idéal pour la vente en gros.',
        description: 'Description ou notes complémentaires sur l\'usage de ce format',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        example: 12000,
        description: 'Prix unitaire appliqué pour ce format spécifique en FCFA',
        type: Number
    })
    prixUnite: number;

    @ApiProperty({
        description: 'Informations condensées sur l\'article de base propriétaire de ce format',
        example: { nom: 'Ndolé Box Premium' }
    })
    article: {
        nom: string;
    };

    @ApiProperty({
        description: 'État actuel des stocks et indicateurs logistiques pour ce format d\'emballage (null si aucun stock n\'est initialisé)',
        nullable: true,
        example: { id: 'stk_999888', quantiteActuelle: 45, niveauAlerte: 'NORMAL' }
    })
    stock: {
        id: string;
        quantiteActuelle: number;
        niveauAlerte: string;
    } | null;
}