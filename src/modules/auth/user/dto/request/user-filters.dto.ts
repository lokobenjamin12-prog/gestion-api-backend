import { IsOptional, IsBoolean, IsInt, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger'; // Importation du décorateur Swagger dédié

export class UserFiltersDto {

    @ApiPropertyOptional({
        description: 'Filtrer par statut d\'archivage (true pour voir les comptes désactivés/soft-deleted, false pour les comptes actifs)',
        example: false,
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ obj }) => obj.estArchive === 'true' || obj.estArchive === true)
    estArchive?: boolean;



    @ApiPropertyOptional({
        description: 'Filtrer les utilisateurs rattachés à un rôle spécifique via son ID',
        example: 3,
        type: Number,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    roleId?: number;

    @ApiPropertyOptional({
        description: 'Recherche textuelle partielle sur le nom, prénom ou adresse email de l\'utilisateur',
        example: 'Heidi',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Numéro de la page à récupérer',
        default: 1,
        example: 1,
        type: Number,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Nombre maximal d\'utilisateurs retournés par page',
        default: 10,
        example: 10,
        type: Number,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}