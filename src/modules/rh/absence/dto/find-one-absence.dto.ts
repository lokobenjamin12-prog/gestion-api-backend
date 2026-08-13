import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindOneAbsenceDto {
    @ApiProperty({
        example: 'usr_heidi123abc',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur recherché'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        example: 7,
        description: 'Le numéro du mois à extraire (1 pour Janvier, 12 pour Décembre)',
        minimum: 1,
        maximum: 12,
        type: Number
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mois: number;

    @ApiProperty({
        example: 2026,
        description: 'L\'année correspondante pour le bilan des absences',
        minimum: 2000,
        type: Number
    })
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    annee: number;
}