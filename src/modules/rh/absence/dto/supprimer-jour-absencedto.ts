import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

// ── Supprimer un jour d'absence ───────────────────────────────────────────────
export class SupprimerJourAbsenceDto {
    @ApiProperty({
        example: 'usr_heidi123abc',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur concerné par la suppression'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        example: '2026-07-15',
        description: 'La date exacte du jour d\'absence à supprimer au format ISO (YYYY-MM-DD)'
    })
    @IsDateString({}, { message: 'date doit être au format ISO : YYYY-MM-DD' })
    date: string;
} 