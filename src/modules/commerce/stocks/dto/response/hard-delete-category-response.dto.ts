import { ApiProperty } from '@nestjs/swagger';

export class HardDeleteCategoryResponseDto {
    @ApiProperty({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) du format/catégorie qui vient d\'être définitivement purgé de la base'
    })
    id: string;

    @ApiProperty({
        example: 'Carton',
        description: 'Nom unique du format de conditionnement supprimé'
    })
    nomUnique: string;

    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article parent auquel ce format était rattaché'
    })
    articleNom: string;

    @ApiProperty({
        example: 'Le format "Carton" rattaché à l\'article "Ndolé Box Premium" a été définitivement supprimé du système.',
        description: 'Message de confirmation de la purge complète destiné à alimenter vos alertes ou notifications de type Toast'
    })
    message: string;

    @ApiProperty({
        example: '2026-07-07T08:30:00.000Z',
        description: 'Timestamp de l\'exécution de l\'opération de suppression physique dans PostgreSQL'
    })
    deletedAt: Date;
}