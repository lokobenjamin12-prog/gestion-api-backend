
import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthModule, LogLevel, Reason, State } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger'; // 1. Utilisation de ApiPropertyOptional car tout est optionnel ici

export class AuthLogFiltersDto {
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
        type: String,
    })
    @IsOptional()
    @IsString()
    actorId?: string;

    @ApiPropertyOptional({
        description: 'Sous-module d\'authentification concerné',
        enum: AuthModule, // 2. Passez directement l'enum pour avoir un menu déroulant automatique sur Swagger
    })
    @IsOptional()
    @IsEnum(AuthModule)
    module?: AuthModule;

    @ApiPropertyOptional({
        description: 'Nom de l\'action ou de la fonction système exécutée',
        example: 'auth.login.success',
        type: String,
    })
    @IsOptional()
    @IsString()
    action?: string;

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

    @ApiPropertyOptional({
        description: 'Raison ou motif lié au statut de l\'action',
        enum: Reason,
    })
    @IsOptional()
    @IsEnum(Reason)
    reason?: Reason;

    @ApiPropertyOptional({
        description: 'Filtrer les lignes par adresse email ciblée ou concernée',
        example: 'heidi.dev@ndolecam.com',
        type: String,
    })
    @IsOptional()
    @IsString()
    email?: string;

    // ─── Filtres dates ────────────────────────────────────────────────────────
    @ApiPropertyOptional({
        description: 'Date de début de recherche au format ISO',
        example: '2026-01-01',
        type: String,
    })
    @IsOptional()
    @IsString()
    dateDebut?: string; // format ISO : "2026-01-01"

    @ApiPropertyOptional({
        description: 'Date de fin de recherche au format ISO',
        example: '2026-12-31',
        type: String,
    })
    @IsOptional()
    @IsString()
    dateFin?: string;   // format ISO : "2026-12-31"
}