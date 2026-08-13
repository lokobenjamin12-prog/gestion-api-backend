
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetCategoriesQueryDto {
    // --- FILTRAGE ---
    @ApiPropertyOptional({
        example: 'art_123abc456',
        description: 'Filtrer les formats/catégories appartenant à un article spécifique via son identifiant unique',
    })
    @IsOptional()
    @IsString()
    articleId?: string; // Permet de lister les formats d'un article spécifique

    @ApiPropertyOptional({
        example: 'Carton',
        description: 'Recherche textuelle floue sur le nom unique ou le libellé de la catégorie/format',
    })
    @IsOptional()
    @IsString()
    search?: string; // Pour une recherche par nom de format (ex: "carton")

    // --- PAGINATION ---
    @ApiPropertyOptional({
        description: 'Index de la page à récupérer',
        default: 1,
        example: 1,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number) // Convertit la string de l'URL en Number
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Nombre maximal de catégories/formats à retourner par page',
        default: 10,
        example: 10,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}