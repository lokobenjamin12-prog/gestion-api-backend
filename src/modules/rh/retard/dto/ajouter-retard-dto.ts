import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsString, Max, Min, ValidateNested } from "class-validator";
import { JourRetardDto } from "./jour-retard.dto";
import { ApiProperty } from "@nestjs/swagger";

export class AjouterRetardDto {
    @ApiProperty({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur concerné'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        example: 7,
        description: 'Le mois correspondant pour le traitement du compteur RH (1 à 12)',
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
        description: 'L\'année correspondante pour le traitement du compteur RH',
        minimum: 2000,
        type: Number
    })
    @IsInt()
    @Min(2000)
    annee: number;

    @ApiProperty({
        type: [JourRetardDto],
        description: 'Tableau contenant la liste des journées de retard à enregistrer ou fusionner en base de données.'
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Au moins un jour est requis' })
    @ValidateNested({ each: true })
    @Type(() => JourRetardDto)
    jours: JourRetardDto[];
}