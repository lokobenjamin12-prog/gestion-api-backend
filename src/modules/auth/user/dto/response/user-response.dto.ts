import { ApiProperty } from '@nestjs/swagger';

export class UserMetaDto {
    @ApiProperty({ example: 100, description: 'Nombre total de lignes correspondant aux filtres' })
    total: number;

    @ApiProperty({ example: 1, description: 'Index de la page courante' })
    page: number;

    @ApiProperty({ example: 10, description: 'Nombre d\'éléments maximum retournés par page' })
    limit: number;

    @ApiProperty({ example: 10, description: 'Numéro de la dernière page disponible' })
    lastPage: number;

    @ApiProperty({ example: true, description: 'Indique s\'il existe une page suivante' })
    hasNextPage: boolean;

    @ApiProperty({ example: false, description: 'Indique s\'il existe une page précédente' })
    hasPrevPage: boolean;
}

export class PaginatedUserResponseDto {
    @ApiProperty({
        type: [Object], // Ideally, replace Object with your concrete SanitizedUserDto if you have one
        description: 'Liste des utilisateurs filtrés et nettoyés'
    })
    data: any[];

    @ApiProperty({
        type: UserMetaDto,
        description: 'Informations et indicateurs de navigation de la pagination'
    })
    meta: UserMetaDto;
}