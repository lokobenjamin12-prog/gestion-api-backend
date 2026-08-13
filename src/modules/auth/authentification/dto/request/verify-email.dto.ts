import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 1. Importation du décorateur Swagger

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Le token de vérification d\'email reçu par l\'utilisateur',
    example: 'v3r1f_t0k3n_abc123...',
    required: true,
  }) // 2. Configuration des métadonnées Swagger
  @IsString()
  @IsNotEmpty({ message: 'Le token est requis' })
  token: string;
}