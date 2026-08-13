import { ApiProperty } from '@nestjs/swagger';

export class ArticleItemResponseDto {
    @ApiProperty({
        example: 'art_123xyzabc',
        description: 'Identifiant unique de la référence de base de l\'article'
    })
    id: string;

    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article'
    })
    nom: string;

    @ApiProperty({
        example: '2026-05-15T08:00:00.000Z',
        description: 'Date de création de l\'article en base'
    })
    createdAt: Date;

    @ApiProperty({
        example: false,
        description: 'Indique si l\'article est actuellement archivé logiquement (soft-delete)'
    })
    isArchived: boolean;

    @ApiProperty({
        example: ['Carton', 'Sachet', 'Pot'],
        description: 'Liste des noms de formats ou catégories de conditionnement existants et actifs pour cet article',
        type: [String]
    })
    formats: string[];

    @ApiProperty({
        example: 250,
        description: 'Somme cumulée des quantités physiques disponibles, tous formats confondus',
        type: Number
    })
    quantiteTotale: number;

    @ApiProperty({
        example: 375000,
        description: 'Valeur financière totale estimée du stock en magasin pour cet article (Somme de: quantité × prixUnite du format) en FCFA',
        type: Number
    })
    valeurTotale: number;

    @ApiProperty({
        example: false,
        description: 'Drapeau d\'alerte global : passe à true si au moins un des formats de l\'article a franchi son seuil d\'alerte ou critique'
    })
    enAlerte: boolean;
}