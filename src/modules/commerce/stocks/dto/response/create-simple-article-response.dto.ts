import { ApiProperty } from '@nestjs/swagger';

export class CreateSimpleArticleResponseDto {
    @ApiProperty({
        example: 'art_brut111xyz',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article de base créée'
    })
    id: string;

    @ApiProperty({
        example: 'Ndolé Premium Brut',
        description: 'Nom de la référence d\'article enregistré en base'
    })
    nom: string;

    @ApiProperty({
        example: 'La référence d\'article "Ndolé Premium Brut" a été enregistrée avec succès.',
        description: 'Message de succès destiné à être affiché directement dans une notification sur le client'
    })
    message: string;

    @ApiProperty({
        example: '2026-07-06T18:20:00.000Z',
        description: 'Timestamp précis de la création de la ligne en base PostgreSQL'
    })
    createdAt: Date;
}