import { ApiProperty } from '@nestjs/swagger';

// 1. Sous-classe représentant une ligne d'historique de flux de stock
export class MovementItemDto {
    @ApiProperty({
        example: 'mvt_123xyz789',
        description: 'Identifiant unique (UUID/CUID) du mouvement de stock enregistré'
    })
    id: string;

    @ApiProperty({
        example: 'ENTREE',
        enum: ['ENTREE', 'SORTIE', 'AJUSTEMENT'],
        description: 'Nature du flux physique ou logique appliqué au stock'
    })
    type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';

    @ApiProperty({
        example: 50,
        description: 'Quantité d\'unités absolues ayant transité lors de ce mouvement',
        type: Number
    })
    quantite: number;

    @ApiProperty({
        example: 120,
        description: 'Niveau physique du stock disponible IMMÉDIATEMENT AVANT le calcul du mouvement',
        type: Number
    })
    avant: number;

    @ApiProperty({
        example: 170,
        description: 'Niveau physique du stock disponible IMMÉDIATEMENT APRÈS la validation du mouvement (avant + quantite)',
        type: Number
    })
    apres: number;

    @ApiProperty({
        example: 'Livraison fournisseur mensuelle - Facture #NF2026-99',
        description: 'Raison ou contexte métier justifiant l\'opération sur l\'inventaire'
    })
    motif: string;

    @ApiProperty({
        example: '2026-07-07T08:33:00.000Z',
        description: 'Date et heure de l\'écriture ou de l\'application comptable du mouvement'
    })
    date: Date;

    @ApiProperty({
        example: false,
        description: 'Passe à true si l\'opération est automatisée par le système (ex: vente e-commerce, annulation automatique) ou false si saisie manuelle'
    })
    isSystem: boolean;

    @ApiProperty({
        example: 'art_ndole456',
        description: 'Identifiant de l\'article racine concerné'
    })
    articleId: string;

    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article au moment du mouvement'
    })
    articleNom: string;

    @ApiProperty({
        example: 'Carton',
        description: 'Nom du format de conditionnement ou de la catégorie touchée'
    })
    categoryNom: string;

    @ApiProperty({
        example: 'Heidi Minaj',
        description: 'Identité complète (Prénom et Nom) de l\'agent ou de l\'administrateur à l\'origine du flux'
    })
    auteur: string;
}

// 2. DTO Principal pour l\'enveloppe globale de l\'historique paginé
export class MovementHistoryResponseDto {
    @ApiProperty({
        type: [MovementItemDto],
        description: 'Tableau chronologique contenant les lignes d\'audit de stock pour la page courante'
    })
    data: MovementItemDto[];

    @ApiProperty({
        description: 'Métadonnées de pagination spécifiques pour caler vos tableaux ou graphes de flux logistiques',
        example: {
            totalItems: 1450,
            itemCount: 10,
            itemsPerPage: 10,
            totalPages: 145,
            currentPage: 1
        }
    })
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}