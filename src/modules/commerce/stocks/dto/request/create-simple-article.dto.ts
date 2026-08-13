import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateSimpleArticleDto {

    @ApiProperty({
        example: 'Ndolé Premium Brut',
        description: 'Le nom de la référence brute de l\'article (sans catégorie ni stock associé)',
        maxLength: 100,
        required: true,
    })
    @IsString()
    @IsNotEmpty({ message: "Le nom de l'article est obligatoire." })
    @MaxLength(100, { message: "Le nom de l'article est trop long (max 100 caractères)." })
    nomArticle: string;
}