import { IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FindOneRetardDto {
    @ApiProperty({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur ciblé'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        example: 7,
        description: 'Numéro du mois recherché (1 à 12)',
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
        description: 'Année civile recherchée (ex: 2026)',
        minimum: 2000,
        type: Number
    })
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    annee: number;
}