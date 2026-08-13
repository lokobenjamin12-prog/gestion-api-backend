import { ArticleItemResponseDto } from "./article-item-response-dto";
import { ApiProperty } from '@nestjs/swagger';

// 1. Sous-classe locale pour encapsuler les métadonnées de pagination
class PaginationMeta {
    @ApiProperty({
        example: 120,
        description: 'Nombre total de références articles correspondant aux filtres appliqués en base'
    })
    total: number;

    @ApiProperty({
        example: 1,
        description: 'Index de la page actuelle retournée'
    })
    page: number;

    @ApiProperty({
        example: 10,
        description: 'Nombre maximal d\'éléments demandés par page'
    })
    limit: number;

    @ApiProperty({
        example: 12,
        description: 'Nombre total de pages calculé (total / limit arrondi au supérieur)'
    })
    totalPages: number;

    @ApiProperty({
        example: true,
        description: 'Indique s\'il existe une page suivante disponible'
    })
    hasNextPage: boolean;

    @ApiProperty({
        example: false,
        description: 'Indique s\'il existe une page précédente'
    })
    hasPreviousPage: boolean;
}

// 2. DTO principal de l\'enveloppe de réponse globale
export class GetArticlesResponseDto {
    @ApiProperty({
        type: [ArticleItemResponseDto],
        description: 'Tableau contenant les fiches articles condensées de la page courante'
    })
    data: ArticleItemResponseDto[];

    @ApiProperty({
        type: PaginationMeta,
        description: 'Métadonnées structurelles pour piloter les contrôles de navigation du dashboard'
    })
    meta: PaginationMeta;
}