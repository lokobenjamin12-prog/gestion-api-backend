import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllAbsencesDto {
    @ApiPropertyOptional({
        example: 'usr_heidi123abc',
        description: 'Filtrer les absences pour un collaborateur spécifique (UUID/CUID)'
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({
        example: 7,
        description: 'Filtrer par mois (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mois?: number;

    @ApiPropertyOptional({
        example: 2026,
        description: 'Filtrer par année',
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
        description: 'Numéro de la page pour la pagination',
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
        example: 10,
        description: 'Nombre maximal d\'éléments renvoyés par page (max 100 pour préserver les performances)',
        minimum: 1,
        maximum: 100,
        default: 10,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}