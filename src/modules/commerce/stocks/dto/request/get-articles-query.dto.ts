import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Je te suggère de créer/utiliser cet enum pour plus de clarté
export enum ArticleStatusFilter {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    ALL = 'ALL'
}

export class GetArticlesQueryDto {
    @ApiPropertyOptional({
        description: 'Index de la page à récupérer',
        default: 1,
        example: 1,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Nombre maximal de références articles à retourner par page',
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

    @ApiPropertyOptional({
        description: 'Recherche textuelle floue sur le nom ou la description de l\'article',
        example: 'Ndolé',
    })
    @IsOptional()
    @IsString()
    search?: string;

    // --- MODIFICATION ICI ---
    @ApiPropertyOptional({
        enum: ArticleStatusFilter,
        default: ArticleStatusFilter.ACTIVE,
        description: 'Filtre d\'état sur l\'objet principal Article (Actifs uniquement, Archivés/Soft-deleted, ou l\'intégralité)',
        example: ArticleStatusFilter.ACTIVE,
    })
    @IsOptional()
    @IsEnum(ArticleStatusFilter)
    // On utilise "status" car il définit l'état de l'objet principal (l'Article)
    status?: ArticleStatusFilter = ArticleStatusFilter.ACTIVE;
}