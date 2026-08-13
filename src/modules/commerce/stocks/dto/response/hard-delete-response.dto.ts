import { ApiProperty } from '@nestjs/swagger';

export class HardDeleteResponseDto {
    @ApiProperty({
        example: 'art_123xyzabc',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article qui vient d\'être définitivement purgée du système'
    })
    deletedId: string;

    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article qui a été supprimé'
    })
    articleName: string;

    @ApiProperty({
        example: 'L\'article "Ndolé Box Premium" ainsi que toutes ses catégories et lignes de stock associées ont été définitivement supprimés.',
        description: 'Message de confirmation de destruction complète destiné à être affiché dans une notification critique sur le frontend'
    })
    message: string;

    @ApiProperty({
        example: '2026-07-07T08:32:15.000Z',
        description: 'Timestamp précis de l\'exécution de la suppression physique dans la base PostgreSQL'
    })
    timestamp: Date;
}