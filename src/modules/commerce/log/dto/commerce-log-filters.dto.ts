import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CommerceModule, LogLevel, State } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CommerceLogFiltersDto {
    // ─── Pagination ───────────────────────────────────────────────────────────
    @ApiPropertyOptional({
        description: 'Numéro de la page à récupérer (commence à 1)',
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
        description: 'Nombre maximal d\'enregistrements retournés par page (limite de sécurité à 100 max)',
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

    // ─── Filtres métier ───────────────────────────────────────────────────────
    @ApiPropertyOptional({
        description: 'Filtrer par l\'identifiant unique (UUID) de l\'utilisateur qui a effectué l\'action',
        example: 'usr_abc123xyz',
    })
    @IsOptional()
    @IsString()
    actorId?: string;

    @ApiPropertyOptional({
        enum: CommerceModule,
        description: 'Filtrer par sous-module commercial de Ndolecam',
        example: 'VENTE', // Ajustez selon les valeurs de votre enum Prisma (ex: VENTE, STOCK, ACHAT, etc.)
    })
    @IsOptional()
    @IsEnum(CommerceModule)
    module?: CommerceModule;

    @ApiPropertyOptional({
        description: 'Filtrer par le nom de l\'action technique exécutée',
        example: 'CREATE_INVOICE',
    })
    @IsOptional()
    @IsString()
    action?: string;

    @ApiPropertyOptional({
        enum: LogLevel,
        description: 'Niveau de sévérité du log d\'audit',
        example: 'INFO', // Ajustez selon votre enum Prisma (ex: INFO, WARN, ERROR)
    })
    @IsOptional()
    @IsEnum(LogLevel)
    level?: LogLevel;

    @ApiPropertyOptional({
        enum: State,
        description: 'Statut final de l\'opération commerciale',
        example: 'SUCCESS', // Ajustez selon votre enum Prisma (ex: SUCCESS, FAILED)
    })
    @IsOptional()
    @IsEnum(State)
    state?: State;

    @ApiPropertyOptional({
        description: 'Filtrer par l\'identifiant de la ressource ciblée (ex: ID d\'une vente, d\'un produit)',
        example: 'fact_789vbn',
    })
    @IsOptional()
    @IsString()
    entityId?: string;

    // ─── Filtres dates ────────────────────────────────────────────────────────
    @ApiPropertyOptional({
        description: 'Borne inférieure de la plage de recherche (Format ISO 8601: YYYY-MM-DD)',
        example: '2026-07-01',
    })
    @IsOptional()
    @IsString()
    dateDebut?: string;

    @ApiPropertyOptional({
        description: 'Borne supérieure de la plage de recherche (Format ISO 8601: YYYY-MM-DD)',
        example: '2026-07-06',
    })
    @IsOptional()
    @IsString()
    dateFin?: string;
}