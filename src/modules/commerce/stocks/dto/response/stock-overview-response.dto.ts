import { ApiProperty } from '@nestjs/swagger';

// 1. Sous-classe pour piloter l'habillage graphique et les alertes de l'interface
class StockAlerteStyleDto {
    @ApiProperty({
        example: 'Critique',
        description: 'Label textuel formaté pour être affiché dans un badge'
    })
    label: string;

    @ApiProperty({
        example: '#EF4444',
        description: 'Code couleur hexadécimal ou classe utilitaire (ex: red-500) pour piloter directement le style CSS/Tailwind ou Flutter'
    })
    color: string;

    @ApiProperty({
        example: 'Seuil critique atteint. Commande fournisseur urgente.',
        description: 'Message d\'avertissement logistique détaillé'
    })
    message: string;
}

// 2. DTO Principal pour la ligne de vue d'ensemble du stock
export class StockOverviewItemDto {
    @ApiProperty({
        example: 'stk_overview789xyz',
        description: 'Identifiant unique de la ligne d\'inventaire associée'
    })
    stockId: string;

    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Nom de la référence d\'article'
    })
    nomArticle: string;

    @ApiProperty({
        example: 'Carton',
        description: 'Nom du format de conditionnement ou de la catégorie'
    })
    categoryNom: string;

    @ApiProperty({
        example: 12000,
        description: 'Prix unitaire appliqué pour ce format spécifique en FCFA',
        type: Number
    })
    prixUnitaireCategory: number;

    @ApiProperty({
        example: 3,
        description: 'Quantité physique actuellement disponible en magasin',
        type: Number
    })
    quantite: number;

    @ApiProperty({
        example: 'CRITICAL',
        enum: ['NORMAL', 'LOW', 'CRITICAL'],
        description: 'Indicateur standardisé du niveau de sécurité du stock'
    })
    niveauAlerte: 'NORMAL' | 'LOW' | 'CRITICAL';

    @ApiProperty({
        example: 36000,
        description: 'Valeur financière totale du stock pour ce format (quantite × prixUnitaireCategory) en FCFA',
        type: Number
    })
    valeurStock: number;

    @ApiProperty({
        type: StockAlerteStyleDto,
        description: 'Configuration esthétique et textuelle de l\'alerte pour l\'interface utilisateur'
    })
    alerte: StockAlerteStyleDto;
}