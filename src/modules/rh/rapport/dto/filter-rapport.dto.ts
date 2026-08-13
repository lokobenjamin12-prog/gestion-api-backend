// src/rapport/rapport.service.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RapportType, ExportFormat, AuditModule, LogLevel, State } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';


export class FilterRapportDto {
    @ApiPropertyOptional({
        enum: RapportType,
        description: 'Filtrer l\'historique par nature thématique du rapport (ABSENCES, MASSE_SALARIALE, CONTRATS_CDD)'
    })
    @IsOptional()
    @IsEnum(RapportType, {
        message: "Le type de rapport fourni n'est pas valide.",
    })
    type?: RapportType;

    @ApiPropertyOptional({
        example: 'usr_employee123',
        description: 'Filtrer les rapports générés spécifiquement pour ou par un collaborateur (UUID/CUID)'
    })
    @IsOptional()
    @IsString({ message: "L'identifiant de l'utilisateur doit être un texte." })
    userId?: string;

    @ApiPropertyOptional({
        example: 7,
        description: 'Filtrer par mois de validité du rapport (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "Le mois doit être un nombre." })
    @Min(1, { message: "Le mois doit être entre 1 et 12." })
    @Max(12, { message: "Le mois doit être entre 1 et 12." })
    mois?: number;

    @ApiPropertyOptional({
        example: 2026,
        description: 'Filtrer par année de validité du rapport (Historique disponible : 2020 - 2026)',
        minimum: 2020,
        maximum: 2026,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "L'année doit être un nombre." })
    @Min(2020, { message: "L'année minimale supportée est 2020." })
    @Max(2026, { message: "L'année ne peut pas être dans le futur." })
    annee?: number;

    @ApiPropertyOptional({
        example: false,
        description: 'Si positionné à true, inclut également les rapports placés dans la corbeille (soft deleted)',
        default: false,
        type: Boolean
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true) // Convertit la string de l'URL en vrai Boolean
    @IsBoolean()
    includeArchived?: boolean = false;

    // ─── PARAMÈTRES DE PAGINATION AJOUTÉS ───

    @ApiPropertyOptional({
        example: 1,
        description: 'Numéro de la page demandée pour l\'affichage de l\'historique',
        minimum: 1,
        default: 1,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "La page doit être un nombre entier." })
    @Min(1, { message: "Le numéro de page minimum est 1." })
    page?: number = 1; // Page 1 par défaut

    @ApiPropertyOptional({
        example: 50,
        description: 'Nombre maximal d\'entrées d\'historique renvoyées par page (maximum : 100)',
        minimum: 1,
        maximum: 100,
        default: 50,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "La limite doit être un nombre entier." })
    @Min(1, { message: "La limite minimale est de 1 ligne." })
    @Max(100, { message: "Vous ne pouvez pas demander plus de 100 lignes par page." })
    limit?: number = 50; // 50 lignes par défaut
}