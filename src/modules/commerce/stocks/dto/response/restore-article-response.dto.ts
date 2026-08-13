import { ApiProperty } from '@nestjs/swagger';

export class RestoreArticleResponseDto {
    @ApiProperty({
        example: 'art_123xyzabc',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article qui vient d\'être restaurée'
    })
    id: string;

    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article réactivé'
    })
    nom: string;

    @ApiProperty({
        example: 'L\'article "Ndolé Box Premium" a été restauré avec succès et est de nouveau actif.',
        description: 'Message de succès destiné à alimenter une notification Toast sur votre interface utilisateur'
    })
    message: string;

    @ApiProperty({
        example: '2026-07-07T08:43:00.000Z',
        description: 'Timestamp précis confirmant l\'instant de la réactivation de l\'élément en base PostgreSQL'
    })
    restoredAt: Date;
}