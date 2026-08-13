
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 1. Importation du décorateur Swagger

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Le Refresh Token JWT valide pour générer une nouvelle session',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  }) // 2. Ajout des métadonnées Swagger
  @IsString()
  @IsNotEmpty({ message: 'Le refresh token est requis' })
  refreshToken: string;
}