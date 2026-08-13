import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 1. Importation du décorateur Swagger

// forgot-password.dto.ts
export class ForgotPasswordDto {

  @ApiProperty({
    description: 'L\'adresse email de l\'utilisateur qui a oublié son mot de passe',
    example: 'cooper@ndolecam.com',
    required: true,
  }) // 2. Ajout des métadonnées pour Swagger
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  email: string;
}
