import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MinLength } from 'class-validator';
import { IsPasswordMatch } from 'src/common/customValidators/checkMatchingPasswords';
import { ApiProperty } from '@nestjs/swagger'; // 1. Importation du décorateur Swagger

export class RegisterDto {
  @ApiProperty({
    description: 'Adresse email unique de l\'utilisateur',
    example: 'samuel.eto@ndolecam.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'Samuel',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille de l\'utilisateur',
    example: 'Eto\'o',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Numéro de téléphone principal (format international accepté)',
    example: '+237690000000',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  @Matches(/^[+]?[\d\s\-().]{7,20}$/, { message: 'Numéro de téléphone invalide' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Numéro WhatsApp pour les alertes de contrats (optionnel)',
    example: '+237670000000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[+]?[\d\s\-().]{7,20}$/, { message: 'Numéro WhatsApp invalide' })
  whatsappNumber?: string;

  @ApiProperty({
    description: 'Mot de passe sécurisé (Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)',
    example: 'NdoleCam@2026',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
  })
  password: string;

  @ApiProperty({
    description: 'Confirmation du mot de passe (doit être identique au champ password)',
    example: 'NdoleCam@2026',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsPasswordMatch('password')
  confirmPassword: string;

  /*
    @IsEnum(Role, { message: 'Rôle invalide' })
    @IsNotEmpty()
    role: Role;
  */

  @ApiProperty({
    description: 'URL de la photo de profil hébergée',
    example: 'https://storage.googleapis.com/ndolecam-bucket/profiles/samuel.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  profilePicture?: string;
}