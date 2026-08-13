import { ApiProperty } from "@nestjs/swagger";
import { SessionSummaryDto } from "./session-response.dto";

// 1. Un objet réutilisable pour toutes tes futures paginations (Ventes, Stocks, etc.

export class PaginationMetaDto {
    @ApiProperty({
        example: 150,
        description: 'Nombre total d\'enregistrements existants correspondant aux filtres appliqués'
    })
    total: number;

    @ApiProperty({
        example: 1,
        description: 'Index de la page courante renvoyée'
    })
    page: number;

    @ApiProperty({
        example: 20,
        description: 'Nombre maximal d\'éléments demandés par page'
    })
    limit: number;

    @ApiProperty({
        example: 8,
        description: 'Numéro de la dernière page disponible calculée'
    })
    lastPage: number;

    @ApiProperty({
        example: true,
        description: 'Indique s\'il existe une page suivante par rapport à la page courante'
    })
    hasNextPage: boolean;

    @ApiProperty({
        example: false,
        description: 'Indique s\'il existe une page précédente par rapport à la page courante'
    })
    hasPreviousPage: boolean;
}

// 2. Classe de réponse spécifique pour les sessions de vente
export class PaginatedSessionsResponseDto {
    @ApiProperty({
        type: [SessionSummaryDto], // Indique explicitement à Swagger la structure des objets dans le tableau
        description: 'Liste des sessions de vente formatées, filtrées et nettoyées pour la page demandée',
    })
    data: SessionSummaryDto[];

    @ApiProperty({
        type: PaginationMetaDto,
        description: 'Métadonnées et indicateurs de navigation associés à la pagination'
    })
    meta: PaginationMetaDto;
}