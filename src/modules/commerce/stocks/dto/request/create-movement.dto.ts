// dto/create-movement.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeMouvement } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateMovementDto {
    @ApiProperty({
        example: 'stk_art789',
        description: 'Identifiant unique (UUID/CUID) de la ligne de stock liée à l\'article et son format',
        required: true
    })
    @IsString()
    articleStockId: string;

    @ApiProperty({
        enum: TypeMouvement,
        example: TypeMouvement.ENTREE,
        description: 'Nature ou type du flux de stock à appliquer',
        required: true
    })
    @IsEnum(TypeMouvement)
    type: TypeMouvement;

    @ApiProperty({
        example: 100,
        description: 'Quantité d\'unités impliquées dans le mouvement (doit être strictement supérieure à 0)',
        minimum: 1,
        type: Number,
        required: true
    })
    @IsInt()
    @IsPositive()
    quantite: number;

    @ApiPropertyOptional({
        example: 'Réapprovisionnement fournisseur mensuel',
        description: 'Justification ou contexte de la modification du stock (obligatoire pour les ajustements)',
    })
    @IsOptional()
    @IsString()
    motif?: string;

    @ApiProperty({
        example: '2026-07-06T18:00:00.000Z',
        description: 'Date et heure d\'exécution ou de prise en compte effective du mouvement',
        required: true,
        type: String,
        format: 'date-time'
    })
    @IsNotEmpty({ message: "La date du mouvement est obligatoire" })
    @Type(() => Date)
    @IsDate({ message: "Le format de date est invalide" })
    movementDate: Date;
}