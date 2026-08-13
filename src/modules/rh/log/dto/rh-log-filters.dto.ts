import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { RhModule, LogLevel, State } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RhLogFiltersDto {
    // ─── Pagination ───────────────────────────────────────────────────────────
    @ApiPropertyOptional({
        example: 1,
        description: 'Numéro de la page pour la pagination des logs',
        minimum: 1,
        default: 1,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 20,
        description: 'Nombre maximal de logs retournés par page (limité à 100)',
        minimum: 1,
        maximum: 100,
        default: 20,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    // ─── Filtres métier ───────────────────────────────────────────────────────
    @ApiPropertyOptional({
        example: 'usr_actor123abc',
        description: 'Filtrer par l\'identifiant de l\'utilisateur (auteur) qui a déclenché l\'action'
    })
    @IsOptional()
    @IsString()
    actorId?: string;

    @ApiPropertyOptional({
        enum: RhModule,
        description: 'Filtrer par module fonctionnel de l\'application (ex: CONTRAT, ABSENCE, DEPARTMENT)'
    })
    @IsOptional()
    @IsEnum(RhModule)
    module?: RhModule;

    @ApiPropertyOptional({
        example: 'contrat:create',
        description: 'Nom exact de l\'action ou de la permission exécutée'
    })
    @IsOptional()
    @IsString()
    action?: string;

    @ApiPropertyOptional({
        enum: LogLevel,
        description: 'Niveau de sévérité du log (ex: INFO, WARN, ERROR)'
    })
    @IsOptional()
    @IsEnum(LogLevel)
    level?: LogLevel;

    @ApiPropertyOptional({
        enum: State,
        description: 'Statut du cycle de vie ou état de l\'entité (ex: SUCCESS, FAILED)'
    })
    @IsOptional()
    @IsEnum(State)
    state?: State;

    @ApiPropertyOptional({
        example: 'ctr_cldxyz123',
        description: 'Filtrer par l\'identifiant de la ressource ciblée par l\'action (ID du contrat, ID du département, etc.)'
    })
    @IsOptional()
    @IsString()
    entityId?: string;

    // ─── Filtres dates ────────────────────────────────────────────────────────
    @ApiPropertyOptional({
        example: '2026-07-01T00:00:00.000Z',
        description: 'Borne inférieure de la recherche temporelle (format ISO 8601). Les logs retournés seront égaux ou postérieurs à cette date.'
    })
    @IsOptional()
    @IsString()
    dateDebut?: string;

    @ApiPropertyOptional({
        example: '2026-07-31T23:59:59.999Z',
        description: 'Borne supérieure de la recherche temporelle (format ISO 8601). Les logs retournés seront égaux ou antérieurs à cette date.'
    })
    @IsOptional()
    @IsString()
    dateFin?: string;
}