import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger'; // Importation du décorateur Swagger dédié

export class PaginationDto {

    @ApiPropertyOptional({
        description: 'Numéro de la page à récupérer (commence à 1)',
        default: 1,
        example: 1,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number) // Force la conversion du string (URL) en number
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Nombre maximal d\'éléments retournés par page (limite de sécurité à 100 max)',
        default: 20,
        example: 20,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100) // Sécurité pour éviter de surcharger le serveur
    limit?: number = 20;
}