import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    Min,
} from 'class-validator';

// ── Supprimer une prime par son index dans le tableau ────────────────────────
export class SupprimerPrimeDto {
    @ApiProperty({
        example: 0,
        description: 'L\'index positionnel de la prime à supprimer au sein du tableau des primes de l\'état de paie (commence à 0).',
        minimum: 0,
        type: Number
    })
    @IsInt()
    @Min(0)
    index: number;
}