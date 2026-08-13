import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExportFormat, RapportType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// Remplace ces imports par les vrais chemins de tes enums

export class CreateRapportDto {
    @ApiProperty({
        enum: RapportType,
        example: RapportType.ABSENCES,
        description: 'La nature thématique du rapport à compiler (ABSENCES, MASSE_SALARIALE, ou CONTRATS_CDD)'
    })
    @IsEnum(RapportType, {
        message: "Le type de rapport fourni n'est pas valide. Il doit être soit ABSENCES, soit MASSE_SALARIALE, soit CONTRATS_CDD"
    })
    type: RapportType;

    @ApiPropertyOptional({
        example: 7,
        description: 'Filtrer les données du rapport sur un mois spécifique (1 à 12). Optionnel.',
        minimum: 1,
        maximum: 12,
        type: Number
    })
    @IsOptional()
    @Type(() => Number) // Convertit le string de l'URL/Body en number
    @IsNumber({}, { message: "Le mois doit être un nombre." })
    @Min(1, { message: "Le mois doit être compris entre 1 et 12." })
    @Max(12, { message: "Le mois doit être compris entre 1 et 12." })
    mois?: number;

    @ApiPropertyOptional({
        example: 2026,
        description: 'Filtrer les données du rapport sur une année spécifique (Fenêtre : 2026 - 2030). Optionnel.',
        minimum: 2026,
        maximum: 2030,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "L'année doit être un nombre." })
    @Min(2026, { message: "L'année minimale supportée est 2020." })
    @Max(2030, { message: "L'année ne peut pas être dans le futur." }) // Dynamique ou calé sur 2026
    annee?: number;

    @ApiPropertyOptional({
        example: 'usr_employee123',
        description: 'Cibler un collaborateur unique pour l\'extraction des données (UUID/CUID). Optionnel.'
    })
    @IsOptional()
    @IsString({ message: "L'identifiant de l'utilisateur doit être une chaîne de caractères." })
    userId?: string;

    @ApiProperty({
        enum: ExportFormat,
        example: ExportFormat.PDF,
        description: 'Format de rendu physique du document généré (PDF ou EXCEL)'
    })
    @IsEnum(ExportFormat, {
        message: "Le format d'export doit être PDF ou EXCEL."
    })
    formatExport: ExportFormat;

    // --- AJOUT DE LA PAGINATION SÉCURISÉE ---

    @ApiPropertyOptional({
        example: 1,
        description: 'Numéro de la page de données à inclure dans le rapport global',
        minimum: 1,
        default: 1,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1, { message: "La page doit être supérieure ou égale à 1." })
    page?: number = 1; // Page 1 par défaut si non spécifié

    @ApiPropertyOptional({
        example: 50,
        description: 'Nombre maximal de lignes de données compilées par page de document (Sécurité anti-crash fixée à 250)',
        minimum: 1,
        maximum: 250,
        default: 50,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(250, { message: "Vous ne pouvez pas demander plus de 250 lignes par page." })
    limit?: number = 50; // Limite de 50 lignes par défaut pour éviter le crash "global"
}