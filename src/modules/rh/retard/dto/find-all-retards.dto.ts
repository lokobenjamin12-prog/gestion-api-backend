import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindAllRetardsDto {

    @ApiPropertyOptional({
        example: 'cldxyz123',
        description: 'Filtrer les retards pour un collaborateur spécifique (UUID/CUID)'
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({
        example: 7,
        description: 'Filtrer par numéro de mois (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    })
    @IsOptional()
    @Type(() => Number) // Convertit la string de l'URL en Number
    @IsInt()
    @Min(1)
    @Max(12)
    mois?: number;


    @ApiPropertyOptional({
        example: 2026,
        description: 'Filtrer par année civile (ex: 2026)',
        minimum: 2000,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    annee?: number;

    @ApiPropertyOptional({
        example: 1,
        description: 'Numéro de la page demandée pour la pagination',
        minimum: 1,
        default: 1,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1; // Page par défaut

    @ApiPropertyOptional({
        example: 10,
        description: 'Nombre maximal d\'enregistrements renvoyés par page (limité à 100 pour des raisons de performance)',
        minimum: 1,
        maximum: 100,
        default: 10,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100) // Sécurité : limite maximale de lignes par page
    limit?: number = 10; // Taille par défaut
}