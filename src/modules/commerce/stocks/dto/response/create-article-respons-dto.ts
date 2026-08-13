import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleResponseDto {
    @ApiProperty({
        example: 'art_123xyzabc',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article nouvellement créée'
    })
    id: string;

    @ApiProperty({
        example: 'stk_format456def',
        description: 'Identifiant unique de la ligne de stock associée au format initial (très utile pour une redirection immédiate vers la fiche de gestion de stock)'
    })
    stockId: string;

    @ApiProperty({
        example: 'L\'article Ndolé Box Premium a été initialisé avec succès avec son format Carton et sa ligne de stock.',
        description: 'Message de confirmation de réussite destiné à être affiché dans une notification Toast sur le frontend'
    })
    message: string;

    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Le nom de l\'article créé'
    })
    articleName: string;

    @ApiProperty({
        example: 'Carton',
        description: 'Le nom du format initial ou de la catégorie rattachée au produit'
    })
    categoryName: string;
}