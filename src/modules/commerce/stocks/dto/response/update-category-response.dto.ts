import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryResponseDto {
    @ApiProperty({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) de la catégorie / du format modifié'
    })
    id: string;

    @ApiProperty({
        example: 'Carton',
        description: 'Le nom unique mis à jour (ou conservé) du format de conditionnement'
    })
    nomUnique: string;

    @ApiProperty({
        example: 12500,
        description: 'Le nouveau prix unitaire appliqué à ce format en FCFA',
        type: Number
    })
    prixUnite: number;

    @ApiProperty({
        example: 'Le format "Carton" a été mis à jour avec succès.',
        description: 'Message de confirmation destiné à alimenter directement un composant Toast sur le frontend'
    })
    message: string;

    @ApiProperty({
        example: '2026-07-07T08:49:00.000Z',
        description: 'Timestamp de la transaction généré automatiquement par la clause updatedAt de Prisma dans PostgreSQL'
    })
    updatedAt: Date;
}