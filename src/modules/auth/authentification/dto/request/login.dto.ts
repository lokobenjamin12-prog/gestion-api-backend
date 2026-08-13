import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 1. Importation du décorateur Swagger

export class LoginDto {
  @ApiProperty({
    description: 'L\'adresse email associée au compte de l\'utilisateur',
    example: 'dev.heidi@ndolecam.com',
    required: true,
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Le mot de passe du compte',
    example: '••••••••••••', // Exemple générique pour des raisons de clarté visuelle
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}