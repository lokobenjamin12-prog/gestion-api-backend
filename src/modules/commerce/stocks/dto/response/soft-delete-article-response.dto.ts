import { ApiProperty } from '@nestjs/swagger';

export class DeleteArticleResponseDto {
    @ApiProperty({
        example: 'art_123xyzabc',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article qui vient d\'être archivée logiquement'
    })
    id: string;

    @ApiProperty({
        example: 'L\'article a été archivé avec succès.',
        description: 'Message de confirmation de la suppression logique, prêt à être consommé par un composant Toast sur le frontend'
    })
    message: string;

    @ApiProperty({
        example: '2026-07-07T08:44:00.000Z',
        description: 'Timestamp précis de l\'exécution de la suppression logique (mise à jour du champ deletedAt dans PostgreSQL)'
    })
    deletedAt: Date;
}