
import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger'; // 1. Importation du décorateur Swagger

export class ResendVerificationEmailDto {
    @ApiProperty({
        description: 'L\'adresse email de l\'utilisateur auquel renvoyer le lien de vérification',
        example: 'clara.ndole@ndolecam.com',
        required: true,
    }) // 2. Ajout des métadonnées pour l'interface Swagger
    @IsEmail()
    @IsNotEmpty()
    email: string;
}