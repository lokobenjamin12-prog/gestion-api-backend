import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetMasseSalarialeDto {
    @ApiProperty({
        example: 7,
        description: 'Le numéro du mois ciblé pour le calcul de la masse salariale (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mois: number;

    @ApiProperty({
        example: 2026,
        description: 'L\'année civile ciblée pour le calcul de la masse salariale',
        minimum: 2000,
        type: Number
    })
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    annee: number;

    // ─── PARAMÈTRES DE PAGINATION OPTIONNELS ─────────────────────────────────

    @ApiPropertyOptional({
        example: 1,
        description: 'Numéro de la page demandée pour l\'affichage des lignes d\'agrégation',
        minimum: 1,
        default: 1,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 50,
        description: 'Nombre maximal de lignes de détails renvoyées par page (limité à 100)',
        minimum: 1,
        maximum: 100,
        default: 50,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 50;
}