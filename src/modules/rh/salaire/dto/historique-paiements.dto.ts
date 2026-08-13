import {
    IsOptional,
    IsInt,
    Min,
    Max,
    IsBoolean,
    IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class HistoriquePaiementsDto {
    // ─── PAGINATION ──────────────────────────────────────────────────────────
    @ApiPropertyOptional({
        example: 1,
        description: 'Numéro de la page demandée pour l\'historique',
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
        description: 'Nombre de lignes renvoyées par page (maximum : 100)',
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

    // ─── FILTRES PÉRIODE ──────────────────────────────────────────────────────
    @ApiPropertyOptional({
        example: 2026,
        description: 'Filtrer l\'historique sur une année spécifique',
        minimum: 2020,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2020)
    annee?: number;

    @ApiPropertyOptional({
        example: 7,
        description: 'Filtrer l\'historique sur un mois spécifique (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mois?: number;

    // ─── FILTRES FINANCIERS ───────────────────────────────────────────────────
    @ApiPropertyOptional({
        example: 50000,
        description: 'Montant net minimum versé (borne inférieure)',
        minimum: 0,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    montantMinimum?: number;

    @ApiPropertyOptional({
        example: 500000,
        description: 'Montant net maximum versé (borne supérieure)',
        minimum: 0,
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    montantMaximum?: number;

    // ─── FILTRE ÉCART ─────────────────────────────────────────────────────────
    @ApiPropertyOptional({
        example: false,
        description: 'Si positionné à true, affiche uniquement les fiches de paie présentant un écart de versement (ex: Net à payer de 100 FCFA mais seulement 70 FCFA effectivement versés)',
        type: Boolean
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    avecEcart?: boolean;

    // ─── FILTRE FICHE DE PAIE ─────────────────────────────────────────────────
    @ApiPropertyOptional({
        example: true,
        description: 'Si positionné à true, filtre uniquement les lignes de paie dont le bulletin PDF a déjà été généré',
        type: Boolean
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    avecFiche?: boolean;

    // ─── FILTRE SIGNATURE ─────────────────────────────────────────────────────
    @ApiPropertyOptional({
        example: false,
        description: 'Si positionné à true, filtre les fiches signées électroniquement par l\'employé. Si false, filtre les fiches en attente de signature',
        type: Boolean
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    ficheSigne?: boolean;

    // ─── FILTRES DATES DE CLÔTURE ─────────────────────────────────────────────
    @ApiPropertyOptional({
        example: '2026-01-01',
        description: 'Borne de début pour filtrer par date de clôture comptable effective (Format ISO: YYYY-MM-DD)'
    })
    @IsOptional()
    @IsString()
    dateClotureDebut?: string;

    @ApiPropertyOptional({
        example: '2026-12-31',
        description: 'Borne de fin pour filtrer par date de clôture comptable effective (Format ISO: YYYY-MM-DD)'
    })
    @IsOptional()
    @IsString()
    dateClotureFin?: string;
}