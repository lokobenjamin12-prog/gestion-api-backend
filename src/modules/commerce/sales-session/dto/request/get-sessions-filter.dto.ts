import { IsOptional, IsEnum, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { SessionStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';


export class GetSessionsFilterDto {
    @ApiPropertyOptional({
        enum: SessionStatus,
        description: 'Filtrer les sessions de vente par leur statut actuel',
        example: SessionStatus.OPEN,
    })
    @IsOptional()
    @IsEnum(SessionStatus)
    status?: SessionStatus;

    @ApiPropertyOptional({
        description: 'Filtrer les sessions ouvertes lors d\'un jour spécifique (Format: YYYY-MM-DD)',
        example: '2026-07-06',
    })
    @IsOptional()
    @IsDateString()
    jourOuverture?: string; // ← filter by specific day


    @ApiPropertyOptional({
        description: 'Index de la page à récupérer',
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
        description: 'Nombre maximal d\'enregistrements à retourner par page',
        default: 20,
        example: 20,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}