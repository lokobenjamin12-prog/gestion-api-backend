import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsOptional, IsString, Matches } from "class-validator";

export class MettreAJourJourRetardDto {
    @ApiProperty({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur concerné'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        example: '2026-07-07',
        description: 'La date précise de la journée de retard à modifier au format ISO (YYYY-MM-DD)'
    })
    @IsDateString({}, { message: 'date doit être au format ISO : YYYY-MM-DD' })
    date: string;

    @ApiProperty({
        example: true,
        description: 'Met à jour le statut du retard (vrai si un justificatif a été fourni et validé, faux sinon)'
    })
    @IsBoolean()
    estJustifie: boolean;

    @ApiPropertyOptional({
        example: '08:45',
        description: 'Nouvelle heure effective d\'arrivée au bureau au format 24h (HH:MM). Optionnelle si le retard devient justifié.',
        pattern: '^\\d{2}:\\d{2}$'
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, {
        message: "heureArrivee doit être au format HH:MM — ex: '08:45'",
    })
    heureArrivee?: string;
}