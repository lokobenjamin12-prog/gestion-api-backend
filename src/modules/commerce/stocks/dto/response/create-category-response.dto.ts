import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryResponseDto {
    @ApiProperty({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) de la catégorie ou du format de conditionnement nouvellement créé'
    })
    id: string;

    @ApiProperty({
        example: 'Sachet',
        description: 'Nom unique du format de conditionnement validé'
    })
    nomUnique: string;

    @ApiProperty({
        example: 'art_789qsd456',
        description: 'Identifiant unique de l\'article de base rattaché'
    })
    articleId: string;

    @ApiProperty({
        example: 'stk_format999jkl',
        description: 'Identifiant de la ligne de stock initialisée automatiquement en base pour ce couple article/format'
    })
    stockId: string;

    @ApiProperty({
        example: 'Le format Sachet a été ajouté avec succès et sa ligne de stock a été initialisée.',
        description: 'Message de confirmation de réussite destiné à alimenter vos composants de Toast ou alertes sur le dashboard UI'
    })
    message: string;
}