// On exporte cette sous-classe car elle pourrait servir pour typer des variables dans le service
import { ApiProperty } from '@nestjs/swagger';

// 1. Sous-classe pour le détail par format/stock
export class StockDetailItem {
    @ApiProperty({ example: 'stk_format456', description: 'Identifiant unique de la ligne de stock' })
    stockId: string;

    @ApiProperty({ example: 'Carton', description: 'Nom du format de conditionnement associé (ex: Carton, Sachet)' })
    format: string;

    @ApiProperty({ example: 12000, description: 'Prix unitaire du format en FCFA', type: Number })
    prixUnite: number;

    @ApiProperty({ example: 15, description: 'Quantité physique actuellement disponible en entrepôt', type: Number })
    quantite: number;

    @ApiProperty({
        example: 'CRITIQUE',
        description: 'Niveau d\'alerte logistique calculé (NORMAL, ALERTE, CRITIQUE)'
    })
    niveauAlerte: string;

    @ApiProperty({
        example: 180000,
        description: 'Valeur financière estimée du stock pour ce format (quantite * prixUnite)',
        type: Number
    })
    valeurEstimee: number;
}

// 2. DTO Principal de Réponse Détaillée
export class ArticleDetailResponseDto {
    @ApiProperty({ example: 'art_123xyzabc', description: 'Identifiant unique de la référence de base de l\'article' })
    id: string;

    @ApiProperty({ example: 'Ndolé Box Premium', description: 'Nom de l\'article de base' })
    nom: string;

    @ApiProperty({ example: '2026-05-15T08:00:00.000Z', description: 'Date de création de la référence en base' })
    createdAt: Date;

    @ApiProperty({
        example: false,
        description: 'Indique si l\'article a subi un archivage logique (soft-delete)'
    })
    isArchived: boolean;

    @ApiProperty({
        example: null,
        description: 'Date précise de l\'archivage (null si l\'article est actif)',
        nullable: true
    })
    archivedAt: Date | null;

    @ApiProperty({
        example: true,
        description: 'Indique si l\'article est éligible à des mouvements de stock (devient false si archivé ou verrouillé)'
    })
    canMoveStock: boolean;

    @ApiProperty({
        type: [StockDetailItem],
        description: 'Décomposition des stocks et états financiers par format de conditionnement'
    })
    detailsStock: StockDetailItem[];

    @ApiProperty({
        example: 45,
        description: 'Somme cumulée de toutes les unités physiques, tous formats confondus',
        type: Number
    })
    quantiteTotale: number;
}