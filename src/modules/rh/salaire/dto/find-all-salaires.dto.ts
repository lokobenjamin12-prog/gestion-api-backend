import { IsOptional, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindAllSalairesDto {
    @ApiPropertyOptional({
        example: 'cldxyz123',
        description: 'Filtrer l\'historique des salaires pour un employé spécifique (UUID/CUID)'
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
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mois?: number;

    @ApiPropertyOptional({
        example: 2026,
        description: 'Filtrer par année comptable (Fenêtre : 2000 - 2100)',
        minimum: 2000,
        maximum: 2100,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    annee?: number;

    @ApiPropertyOptional({
        example: false,
        description: 'Filtrer par statut du mois comptable (true pour les fiches clôturées/figées, false pour celles encore modifiables)',
        type: Boolean
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true) // Sécurise la conversion de la string URL en vrai Boolean
    @IsBoolean()
    estCloture?: boolean;

    @ApiPropertyOptional({
        example: 1,
        description: 'Numéro de la page demandée pour l\'affichage de la liste',
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
        description: 'Nombre maximal de fiches de paie renvoyées par page (limité à 100 pour la performance)',
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