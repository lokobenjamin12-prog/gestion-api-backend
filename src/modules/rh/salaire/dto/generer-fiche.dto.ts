// salaire.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
} from 'class-validator';

// ── Générer la fiche de paie (après clôture) ─────────────────────────────────
export class GenererFicheDto {
    /** Date à laquelle le salaire a été ou sera versé (YYYY-MM-DD). */
    @ApiProperty({
        example: '2026-07-31',
        description: 'La date effective ou prévue du versement du salaire au format ISO normalisé (YYYY-MM-DD).'
    })
    @IsDateString({}, { message: 'jourDePaie doit être au format ISO : YYYY-MM-DD' })
    jourDePaie: string;
}