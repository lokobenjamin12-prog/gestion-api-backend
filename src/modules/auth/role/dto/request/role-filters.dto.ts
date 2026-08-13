import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger'; // Importation du décorateur dédié

export class RoleFiltersDto {
    @ApiPropertyOptional({
        description: 'Recherche textuelle partielle sur le nom ou le code du rôle',
        example: 'Comptable',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filtrer les rôles appartenant à un département spécifique via son ID',
        example: 2,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number) // Convertit la string de l'URL en number pour Prisma
    @IsInt()
    departmentId?: number; // Change string en number ici




    @ApiPropertyOptional({
        description: 'Filtrer les rôles possédant une permission spécifique via son ID',
        example: 5,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    permissionId?: number;



    @ApiPropertyOptional({
        description: 'Numéro de la page à récupérer',
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
        description: 'Nombre d\'éléments à retourner par page',
        default: 20,
        example: 20,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}