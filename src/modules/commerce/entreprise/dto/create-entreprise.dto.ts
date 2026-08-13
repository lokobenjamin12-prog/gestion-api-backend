import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateEntrepriseDto {
    @ApiProperty({
        example: 'Société Exemple SARL',
        description: 'Nom officiel de l\'entreprise — apparaît sur les fiches de paie et les contrats',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    nom: string;

    @ApiPropertyOptional({
        example: 'Bastos, Yaoundé, Cameroun',
        description: 'Adresse physique ou siège complet de l\'entreprise',
    })
    @IsOptional()
    @IsString()
    adresse?: string;

    @ApiPropertyOptional({
        example: '+237600000000',
        description: 'Numéro de téléphone principal de la structure (format international recommandé)',
    })
    @IsOptional()
    @IsString()
    telephone?: string;

    @ApiPropertyOptional({
        example: 'contact@entreprise.com',
        description: 'Adresse email de contact ou de support de l\'entreprise',
    })
    @IsOptional()
    @IsEmail()
    email?: string;
}