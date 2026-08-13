import { ApiProperty } from '@nestjs/swagger';

export class DeleteCategoryResponseDto {
    @ApiProperty({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) de la catégorie ou du format qui vient d\'être traité'
    })
    id: string;

    @ApiProperty({
        example: 'Carton',
        description: 'Nom unique du format/catégorie archivé ou supprimé'
    })
    nomUnique: string;

    @ApiProperty({
        example: 'La catégorie "Carton" a été archivée avec succès.',
        description: 'Message de confirmation de l\'opération destiné à alimenter un Toast d\'information'
    })
    message: string;

    @ApiProperty({
        example: '2026-07-06T18:25:00.000Z',
        description: 'Timestamp précis de l\'exécution de l\'archivage logique (ou de la purge effective)'
    })
    archivedAt: Date;
}