import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentFiltersDto {
    @ApiPropertyOptional({
        example: 'RH',
        description: 'Recherche partielle ou complète par nom de département (insensible à la casse)'
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: 1,
        description: 'Numéro de la page pour la pagination',
        minimum: 1,
        default: 1,
        type: Number
    })
    @IsOptional()
    @Type(() => Number) // Convertit la chaîne de l'URL en nombre
    @IsInt()
    @Min(1)
    page?: number = 1;


    @ApiPropertyOptional({
        example: 20,
        description: 'Nombre d’éléments maximum retournés par page (limité à 100 pour des raisons de performance)',
        minimum: 1,
        maximum: 100,
        default: 20,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100) // Sécurité pour éviter de surcharger le serveur
    limit?: number = 20;
}
