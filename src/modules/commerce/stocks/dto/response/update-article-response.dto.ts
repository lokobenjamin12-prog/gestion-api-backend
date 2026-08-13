import { ApiProperty } from '@nestjs/swagger';

export class UpdateArticleResponseDto {
    @ApiProperty({
        example: 'art_123xyzabc',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article qui a été modifiée'
    })
    id: string;

    @ApiProperty({
        example: 'Ndolé Box Premium - Nouvelle Recette',
        description: 'Le nouveau nom mis à jour pour cet article'
    })
    nom: string;

    @ApiProperty({
        example: '2026-07-07T08:48:00.000Z',
        description: 'Timestamp précis de la modification en base PostgreSQL (généré par le champ updatedAt de Prisma)'
    })
    updatedAt: Date;

    @ApiProperty({
        example: 'L\'article a été mis à jour avec succès.',
        description: 'Message de confirmation destiné à être injecté directement dans un composant Toast de notification'
    })
    message: string;
}