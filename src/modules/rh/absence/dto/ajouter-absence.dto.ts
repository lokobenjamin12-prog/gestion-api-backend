import { ApiProperty } from '@nestjs/swagger';
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsString, Max, Min, ValidateNested } from "class-validator";
import { JourAbsenceDto } from "./jour-absence.dto";

// ── Ajouter un ou plusieurs jours d'absence ───────────────────────────────────
export class AjouterAbsenceDto {
    @ApiProperty({
        example: 'usr_heidi123abc',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur concerné par l\'absence'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        example: 7,
        description: 'Le numéro du mois ciblé (1 pour Janvier, 12 pour Décembre)',
        minimum: 1,
        maximum: 12,
        type: Number
    })
    @IsInt()
    @Min(1)
    @Max(12)
    mois: number;

    @ApiProperty({
        example: 2026,
        description: 'L\'année correspondante au traitement RH',
        minimum: 2000,
        type: Number
    })
    @IsInt()
    @Min(2000)
    annee: number;

    @ApiProperty({
        type: [JourAbsenceDto],
        description: 'Tableau contenant la liste des jours à marquer comme absents pour ce mois'
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Au moins un jour est requis' })
    @ValidateNested({ each: true })
    @Type(() => JourAbsenceDto)
    jours: JourAbsenceDto[];
}