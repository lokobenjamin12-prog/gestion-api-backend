import { ApiProperty } from '@nestjs/swagger';

export class RestoreCategoryResponseDto {
    @ApiProperty({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) du format/catégorie qui vient d\'être restauré'
    })
    id: string;

    @ApiProperty({
        example: 'Carton',
        description: 'Nom unique du format de conditionnement réactivé'
    })
    nomUnique: string;

    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article parent auquel ce format est à nouveau rattaché'
    })
    articleNom: string;

    @ApiProperty({
        example: 'Le format "Carton" pour l\'article "Ndolé Box Premium" a été restauré avec succès.',
        description: 'Message de succès destiné à être affiché directement dans un Toast d\'information sur le frontend'
    })
    message: string;
}