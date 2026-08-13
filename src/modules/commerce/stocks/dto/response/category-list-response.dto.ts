import { ApiProperty } from '@nestjs/swagger';

// 1. Sous-classe représentant une ligne de catégorie/format dans la liste
export class CategoryItemDto {
    @ApiProperty({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique de la catégorie ou du format de conditionnement'
    })
    id: string;

    @ApiProperty({
        example: 'Sachet',
        description: 'Nom unique du format de conditionnement'
    })
    nomUnique: string;

    @ApiProperty({
        example: 750,
        description: 'Prix unitaire appliqué pour ce format en FCFA',
        type: Number
    })
    prixUnite: number;

    @ApiProperty({
        example: 'Format économique individuel',
        description: 'Notes ou description du format (null si non renseigné)',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        example: 120,
        description: 'Quantité physique actuellement disponible en stock pour ce format d\'emballage',
        type: Number
    })
    quantiteDisponible: number;

    @ApiProperty({
        example: 'NORMAL',
        description: 'Statut de l\'alerte de stock calculé pour ce format (NORMAL, ALERTE, CRITIQUE)'
    })
    alerte: string;

    @ApiProperty({
        description: 'Informations de base sur l\'article rattaché',
        example: { id: 'art_789qsd', nom: 'Ndolé Box Premium' }
    })
    article: {
        id: string;
        nom: string;
    };
}


// 2. DTO Principal pour l\'enveloppe de pagination globale
export class PaginatedCategoryResponseDto {
    @ApiProperty({
        type: [CategoryItemDto],
        description: 'Liste des lignes de formats/catégories correspondant aux critères de la page courante'
    })
    data: CategoryItemDto[];

    @ApiProperty({
        description: 'Métadonnées de pagination pour piloter l\'affichage des boutons de navigation côté frontend',
        example: {
            total: 45,
            page: 1,
            limit: 10,
            totalPages: 5,
            hasNextPage: true,
            hasPreviousPage: false
        }
    })
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}