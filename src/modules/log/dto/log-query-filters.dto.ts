import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { LogLevel, State } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LogQueryFiltersDto {
    // ─── Pagination ───────────────────────────────────────────────────────────
    @ApiPropertyOptional({
        description: 'Numéro de la page à récupérer',
        example: 1,
        default: 1,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Nombre d\'éléments par page (Maximum 100)',
        example: 20,
        default: 20,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    // ─── Filtres métier ───────────────────────────────────────────────────────
    @ApiPropertyOptional({
        description: 'Identifiant unique de l\'acteur (utilisateur connecté) à l\'origine de l\'action',
        example: 'usr_lmlk89210',
    })
    @IsOptional()
    @IsString()
    actorId?: string;

    @ApiPropertyOptional({
        description: 'Niveau de sévérité du log',
        enum: LogLevel,
    })
    @IsOptional()
    @IsEnum(LogLevel)
    level?: LogLevel;

    @ApiPropertyOptional({
        description: 'Statut du résultat de l\'action',
        enum: State,
    })
    @IsOptional()
    @IsEnum(State)
    state?: State;

    // ─── Filtres dates ────────────────────────────────────────────────────────
    @ApiPropertyOptional({
        description: 'Date de début de recherche au format ISO',
        example: '2026-01-01',
    })
    @IsOptional()
    @IsString()
    dateDebut?: string;

    @ApiPropertyOptional({
        description: 'Date de fin de recherche au format ISO',
        example: '2026-12-31',
    })
    @IsOptional()
    @IsString()
    dateFin?: string;
}
