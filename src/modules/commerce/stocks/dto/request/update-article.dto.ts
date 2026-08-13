import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateArticleDto {
    @IsOptional()
    @IsString()
    @MinLength(2, { message: "Le nom doit contenir au moins 2 caractères." })
    @MaxLength(100, { message: "Le nom ne peut pas dépasser 100 caractères." })
    nom?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    unite?: string;
}