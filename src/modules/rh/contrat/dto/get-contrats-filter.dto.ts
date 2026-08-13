import { IsOptional, IsString, IsEnum, IsInt, Min, IsDateString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ContratType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetContratsFilterDto {
    @ApiPropertyOptional({
        example: 'cldxyz123',
        description: 'Filtrer les contrats pour un collaborateur spécifique (UUID/CUID)'
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({
        enum: ContratType,
        example: ContratType.CDI,
        description: 'Filtrer par nature du contrat (CDI ou CDD)'
    })
    @IsOptional()
    @IsEnum(ContratType)
    type?: ContratType;

    @ApiPropertyOptional({
        example: '2024-01-01',
        description: 'Filtrer les contrats dont la date de début est postérieure ou égale à cette date (YYYY-MM-DD)'
    })
    @IsOptional()
    @IsDateString()
    dateDebutFrom?: string;



    @ApiPropertyOptional({
        example: '2024-01-31',
        description: 'Filtrer les contrats dont la date de début est antérieure ou égale à cette date (YYYY-MM-DD)'
    })
    @IsOptional()
    @IsDateString()
    dateDebutTo?: string;



    @ApiPropertyOptional({
        description: 'Inclure les contrats archivés (soft-deleted) dans les résultats',
        default: false,
        type: Boolean,
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeArchived?: boolean = false;



    @ApiPropertyOptional({
        example: 1,
        description: 'Numéro de la page pour la pagination',
        minimum: 1,
        type: Number
    })
    @IsOptional()
    @Type(() => Number) // Convertit la string de l'URL en véritable number
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        example: 10,
        description: 'Nombre maximal d\'éléments renvoyés par page',
        minimum: 1,
        type: Number
    })
    @IsOptional()
    @Type(() => Number) // Convertit la string de l'URL en véritable number
    @IsInt()
    @Min(1)
    limit?: number;
}