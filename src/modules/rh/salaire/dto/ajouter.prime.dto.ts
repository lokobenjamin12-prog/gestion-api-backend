// salaire.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
    IsNumber,
    IsPositive,
    IsString,
    MinLength,
} from 'class-validator';


// ── Ajouter une prime ─────────────────────────────────────────────────────────
export class AjouterPrimeDto {
    @ApiProperty({
        example: 50000,
        description: 'Le montant financier de la prime (en FCFA ou devise locale). Doit être un nombre strictement positif.'
    })
    @IsNumber({}, { message: 'somme doit être un nombre' })
    @IsPositive({ message: 'somme doit être positive' })
    somme: number;

    @ApiProperty({
        example: 'Prime de performance - Clôture projet Ndolecam',
        description: 'Le motif ou la justification de l\'attribution de cette prime (minimum 3 caractères).'
    })
    @IsString()
    @MinLength(3, { message: 'raison doit contenir au moins 3 caractères' })
    raison: string;
}