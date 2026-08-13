// src/role/dto/role.dto.ts
import {
    IsInt,
    IsArray,
    ArrayUnique,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class SyncPermissionsDto {
    @ApiProperty({
        description: 'Liste complète et exclusive des identifiants (IDs) de permissions à associer au rôle. Attention, toutes les permissions actuelles non présentes dans ce tableau seront définitivement révoquées pour ce rôle.',
        example: [1, 2, 3],
        type: [Number], // Indique un tableau d'entiers dans Swagger UI
        required: true,
    })
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    permissionIds: number[];
}