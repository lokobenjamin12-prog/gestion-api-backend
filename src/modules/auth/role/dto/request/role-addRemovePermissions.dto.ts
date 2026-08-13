// src/role/dto/role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayUnique, IsInt } from 'class-validator';

export class AddRemovePermissionsDto {
    @ApiProperty({
        description: 'Tableau contenant les identifiants numériques (IDs) des permissions à ajouter ou retirer du rôle',
        example: [4, 5, 12],
        type: [Number], // Indique explicitement à Swagger qu'il s'agit d'un tableau d'entiers
        required: true,
    })
    @IsArray()
    @ArrayUnique({ message: 'Le tableau ne doit pas contenir de doublons d\'identifiants' })
    @IsInt({ each: true, message: 'Chaque identifiant de permission doit être un nombre entier' })
    permissionIds: number[];
}