// dto/create-category.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsUUID, IsPositive, IsOptional, MinLength, IsInt } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Sachet',
        description: 'Nom unique du format de conditionnement ou de la catégorie (ex: Carton, Sachet, Canette)',
        minLength: 2,
        required: true
    })
    @IsNotEmpty({ message: "Le nom du format est requis (ex: Carton, Sachet, Douzaine)." })
    @IsString()
    @MinLength(2)
    nomUnique: string;

    @ApiProperty({
        example: 750,
        description: 'Prix unitaire de vente appliqué à ce format de conditionnement en FCFA',
        minimum: 0,
        type: Number,
        required: true
    })
    @IsPositive()
    @IsNumber()
    @Min(0, { message: "Le prix unitaire doit être positif." })
    prixUnite: number;

    @ApiPropertyOptional({
        example: 'Conditionnement intermédiaire de 500g destiné à la vente au détail.',
        description: 'Description ou notes complémentaires concernant ce format'
    })
    @IsOptional()
    @IsString()
    description?: string;

    //@IsUUID('4', { message: "L'identifiant de l'article doit être un UUID valide." })
    @ApiProperty({
        example: 'art_123abc456',
        description: 'Identifiant unique (CUID ou UUID) de l\'article de base associé à ce format',
        required: true
    })
    @IsNotEmpty({ message: "L'identifiant de l'article est obligatoire pour lier ce format." })
    articleId: string;

    @ApiPropertyOptional({
        example: 15,
        default: 15,
        description: 'Seuil d\'alerte de stock spécifique pour ce format',
        minimum: 1,
        type: Number
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    seuilAlerte?: number;

    @ApiPropertyOptional({
        example: 5,
        default: 5,
        description: 'Seuil critique de stock spécifique pour ce format',
        minimum: 0,
        type: Number
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    seuilCritique?: number;
}