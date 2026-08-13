import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsString } from 'class-validator';

export class MettreAJourJourAbsenceDto {
    @ApiProperty({
        example: 'usr_heidi123abc',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur dont on modifie l\'absence'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        example: '2026-07-15',
        description: 'La date du jour à modifier au format ISO (YYYY-MM-DD). Le mois et l\'année sont automatiquement extraits de cette chaîne par le serveur.'
    })
    @IsDateString({}, { message: 'date doit être au format ISO : YYYY-MM-DD' })
    date: string;

    @ApiProperty({
        example: true,
        description: 'Le nouveau statut de justification pour cette journée (ex: passage de false à true suite au dépôt d\'un arrêt de travail)'
    })
    @IsBoolean()
    estJustifie: boolean;
}