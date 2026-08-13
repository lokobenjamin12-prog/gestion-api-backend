import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionFiltersDto {
    @ApiPropertyOptional({
        description: 'Recherche textuelle partielle ou complète par mot-clé dans le slug technique',
        example: 'USER',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Numéro de la page à récupérer',
        default: 1,
        example: 1,
        type: Number
    })
    @IsOptional()
    @Type(() => Number) // Convertit la chaîne de l'URL (Query Param) en nombre utilisable par Prisma
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Nombre d’éléments retournés par page (Sécurité étendue jusqu\'à 200 éléments)',
        default: 50,
        example: 50,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(200)
    limit?: number = 50;
}