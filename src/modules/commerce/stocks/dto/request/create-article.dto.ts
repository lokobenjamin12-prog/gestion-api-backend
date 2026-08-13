// dto/create-article.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeSeuil } from '@prisma/client';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, MinLength, IsEnum } from 'class-validator';

export class CreateArticleDto {
    // --- Infos de l'Article ---
    @ApiProperty({
        example: 'Ndolé Box Premium',
        description: 'Nom unique de la référence de base de l\'article',
        minLength: 3,
        required: true
    })
    @IsNotEmpty({ message: "Le nom est requis" })
    @IsString()
    @MinLength(3, { message: "Le nom de l'article doit contenir au moins 3 caractères." })
    nom: string;

    @ApiPropertyOptional({
        example: 'Plat traditionnel de ndolé précuit et conditionné sous vide sous format premium.',
        description: 'Description détaillée du produit ou caractéristiques spécifiques',
        minLength: 5
    })
    @IsOptional()
    @IsString()
    @MinLength(5)
    description?: string;

    // --- Infos du Format Initial (Catégorie) ---
    @ApiProperty({
        example: 'Carton',
        description: 'Nom du format d\'emballage ou de la catégorie initiale (ex: Sachet, Carton, Bouteille)',
        required: true
    })
    @IsString()
    @IsNotEmpty({ message: "Le nom du format initial est requis (ex: Sachet, Carton)." })
    nomUniqueCategory: string;

    @ApiProperty({
        example: 15000,
        description: 'Prix unitaire appliqué pour ce format spécifique en FCFA',
        minimum: 0,
        type: Number,
        required: true
    })
    @IsNumber()
    @Min(0, { message: "Le prix unitaire ne peut pas être négatif." })
    prixUnite: number;

    // --- Nouveaux champs pour l'excellence du stock ---

    @ApiPropertyOptional({
        example: 20,
        default: 20,
        description: 'Seuil d\'alerte de stock (génère une notification préventive)',
        minimum: 1,
        type: Number
    })
    @IsNumber()
    @Min(1, { message: "Le seuil d'alerte doit être au moins de 1" })
    @IsOptional()
    seuilAlerte?: number;

    @ApiPropertyOptional({
        example: 10,
        default: 10,
        description: 'Seuil critique de stock (indique une rupture imminente nécessitant un approvisionnement urgent)',
        minimum: 0,
        type: Number
    })
    @IsNumber()
    @Min(0, { message: "Le seuil critique ne peut pas être négatif" })
    @IsOptional()
    seuilCritique?: number;
}