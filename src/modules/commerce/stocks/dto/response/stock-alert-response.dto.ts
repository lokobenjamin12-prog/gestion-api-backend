import { ApiProperty } from '@nestjs/swagger';

export class StockAlertResponseDto {
    @ApiProperty({
        example: 'stk_alert111xyz',
        description: 'Identifiant unique de la ligne de stock ou de l\'alerte'
    })
    id: string;

    @ApiProperty({
        example: 5,
        description: 'Quantité physique actuellement disponible en entrepôt',
        type: Number
    })
    quantiteActuelle: number;

    @ApiProperty({
        example: 'CRITIQUE',
        description: 'Niveau de sévérité de l\'alerte calculé par le système (ex: ALERTE, CRITIQUE)'
    })
    niveauAlerte: string;

    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article concerné'
    })
    nomArticle: string;

    @ApiProperty({
        example: 'Carton',
        description: 'Format de conditionnement ou catégorie rattachée'
    })
    format: string;

    @ApiProperty({
        example: 12000,
        description: 'Prix unitaire appliqué à ce format en FCFA',
        type: Number
    })
    prixUnite: number;

    @ApiProperty({
        example: 'Attention : Le stock de "Ndolé Box Premium (Carton)" est presque épuisé (5 unités restantes). Réapprovisionnement immédiat requis.',
        description: 'Message contextuel généré pour le rapport logistique ou l\'affichage textuel'
    })
    messageLogistique: string;

    @ApiProperty({
        example: true,
        description: 'Indicateur de priorité absolue. Si true, permet au frontend d\'activer des effets visuels prioritaires (icônes clignotantes, lignes rouges, notifications push)'
    })
    isUrgent: boolean;
}