// salaire.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
    IsNumber,
    IsPositive,
} from 'class-validator';

// ── Enregistrer le montant réellement versé ───────────────────────────────────
export class VersementDto {
    @ApiProperty({
        example: 150000,
        description: 'Le montant financier effectivement versé à l\'employé (en FCFA ou devise locale). Doit être un nombre strictement positif.'
    })
    @IsNumber({}, { message: 'montantVerse doit être un nombre' })
    @IsPositive({ message: 'montantVerse doit être positif' })
    montantVerse: number;
}