// salaire.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsString,
    Max,
    Min,
} from 'class-validator';

// ── Initialiser un salaire pour un employé ────────────────────────────────────

export class InitialiserSalaireDto {
    @ApiProperty({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur pour lequel initialiser l\'état de paie.'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        example: 7,
        description: 'Le numéro du mois à initialiser (1 à 12).',
        minimum: 1,
        maximum: 12,
        type: Number
    })
    @IsInt()
    @Min(1)
    @Max(12)
    mois: number;

    @ApiProperty({
        example: 2026,
        description: 'L\'année civile concernée par l\'état de salaire initial.',
        minimum: 2000,
        type: Number
    })
    @IsInt()
    @Min(2000)
    annee: number;
}