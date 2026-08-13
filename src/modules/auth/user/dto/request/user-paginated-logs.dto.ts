import { ApiProperty } from '@nestjs/swagger';

export class LogResponseDto {

    @ApiProperty({
        example: 'log_abc123xyz',
        description: 'Identifiant unique de la ligne de log d\'audit'
    })
    id: string;

    @ApiProperty({
        example: 'SEARCH_USER_BY_EMAIL',
        description: 'Action technique exécutée par l\'acteur'
    })
    action: string;

    @ApiProperty({
        example: 'USER',
        description: 'Module applicatif concerné par l\'action'
    })
    module: string;

    @ApiProperty({
        example: 'Recherche de l\'utilisateur par email : heidi.dev@ndolecam.com',
        description: 'Message contextuel descriptif de l\'événement'
    })
    message: string;

    @ApiProperty({
        example: 'SUCCESS',
        description: 'Statut final de l\'opération (ex: SUCCESS, FAILED)'
    })
    state: string;

    @ApiProperty({
        example: '2026-07-06T14:30:00.000Z',
        description: 'Date et heure de création de l\'enregistrement'
    })
    createdAt: Date;
}


// Classe imbriquée dédiée pour les métadonnées de pagination (évite les types anonymes)
class PaginationMetaDto {
    @ApiProperty({ example: 142, description: 'Nombre total d\'enregistrements correspondants au filtre' })
    total: number;

    @ApiProperty({ example: 1, description: 'Index de la page actuelle' })
    page: number;

    @ApiProperty({ example: 8, description: 'Numéro de la dernière page disponible' })
    lastPage: number;

    @ApiProperty({ example: 20, description: 'Nombre maximum d\'éléments retournés par page' })
    limit: number;

    @ApiProperty({ example: true, description: 'Indique s\'il existe une page suivante' })
    hasNextPage: boolean;

    @ApiProperty({ example: false, description: 'Indique s\'il existe une page précédente' })
    hasPrevPage: boolean;
}

export class PaginatedLogsDto {
    @ApiProperty({
        type: [LogResponseDto], // Indique explicitement à Swagger qu'il s'agit d'un tableau d'objets LogResponseDto
        description: 'Liste des logs d\'audit de la page courante'
    })
    data: LogResponseDto[];

    @ApiProperty({
        type: PaginationMetaDto, // Utilisation d'une classe dédiée pour documenter l'objet imbriqué
        description: 'Métadonnées de pagination associées à la liste'
    })
    meta: PaginationMetaDto;
}
