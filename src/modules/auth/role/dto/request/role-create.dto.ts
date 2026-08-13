
// src/role/dto/role.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsPositive,
    IsArray,
    ArrayUnique,
    IsOptional,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({
        example: 'Comptable',
        description: 'Intitulé du poste occupé. Le nom technique final du rôle sera généré automatiquement sous la forme : {post}_{department.name}.',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    post: string;

    @ApiProperty({
        example: 2,
        description: 'Identifiant unique numérique du département lié. Utilisé par le système pour générer le nom complet du rôle.',
        required: true,
    })
    @IsInt()
    @IsPositive()
    departmentId: number;

    @ApiProperty({
        example: [1, 3, 5],
        description: 'Tableau contenant les identifiants uniques (IDs) des permissions à affecter initialement à ce rôle.',
        type: [Number], // Assure un affichage correct du tableau d'entiers dans Swagger UI
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    permissionIds?: number[];
}