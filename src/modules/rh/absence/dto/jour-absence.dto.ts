import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString } from "class-validator";

export class JourAbsenceDto {
    @ApiProperty({
        example: '2026-07-15',
        description: 'La date précise de l\'absence au format standardisé ISO (YYYY-MM-DD)'
    })
    @IsDateString({}, { message: 'date doit être au format ISO : YYYY-MM-DD' })
    date: string;

    @ApiProperty({
        example: true,
        description: 'Indique si l\'employé a fourni un justificatif officiel (arrêt maladie, attestation, etc.)'
    })
    @IsBoolean({ message: 'estJustifie doit être un booléen' })
    estJustifie: boolean;
}