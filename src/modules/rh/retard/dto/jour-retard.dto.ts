import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsOptional, IsString, Matches } from "class-validator";

export class JourRetardDto {
    @ApiProperty({
        example: '2026-07-07',
        description: 'La date du retard au format normalisé ISO (YYYY-MM-DD)'
    })
    @IsDateString({}, { message: 'date doit être au format ISO : YYYY-MM-DD' })
    date: string;

    @ApiProperty({
        example: false,
        description: 'Indique si l\'employé a fourni un justificatif valable (certificat médical, panne, etc.) pour ce retard.'
    })
    @IsBoolean({ message: 'estJustifie doit être un booléen' })
    estJustifie: boolean;

    @ApiPropertyOptional({
        example: '08:45',
        description: 'Heure effective d\'arrivée au bureau au format 24h (HH:MM). Obligatoire si le retard est injustifié.',
        pattern: '^\\d{2}:\\d{2}$'
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, {
        message: "heureArrivee doit être au format HH:MM — ex: '08:45'",
    })
    heureArrivee?: string;
}