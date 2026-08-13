import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class GetCategoriesByArticleQueryDto {
    @ApiPropertyOptional({
        description: 'Index de la page à récupérer pour les formats/catégories liés',
        default: 1,
        example: 1,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

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
    limit?: number;
}