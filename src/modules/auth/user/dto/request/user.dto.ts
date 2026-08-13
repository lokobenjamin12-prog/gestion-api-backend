
// src/user/dto/user.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsOptional,
    IsInt,
    IsPositive,
    IsDateString,
    IsEnum,
    MinLength,
    Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { HoraireEnum } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({
        example: 'alice@entreprise.com',
        description: 'Adresse email professionnelle unique de l\'employé.'
    })
    @IsEmail()
    email: string;


    @ApiProperty({
        example: 'MotDePasse@123',
        minLength: 8,
        description: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'
    }) @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
        message:
            'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    })
    password: string;

    @ApiProperty({ example: 'Alice', description: 'Prénom de l\'employé' }) @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Dupont', description: 'Nom de famille de l\'employé' }) @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: '+237600000000', description: 'Numéro de téléphone principal (format international requis)' }) @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiPropertyOptional({ example: '+237600000001', description: 'Numéro WhatsApp pour les alertes automatiques de contrats' }) @IsOptional()
    @IsString()
    whatsappNumber?: string;

    @ApiProperty({ example: 1, description: 'Identifiant unique (ID) du rôle lié aux permissions de l\'utilisateur' }) @IsInt()
    @IsPositive()
    roleId: number;

    // ── Données RH ────────────────────────────────────────────────────────────

    @ApiPropertyOptional({ example: '1990-05-15', description: 'Date de naissance (Format ISO 8601 YYYY-MM-DD)' }) @IsOptional()
    @IsDateString()
    dateNaissance?: string;

    @ApiPropertyOptional({ example: '2024-01-01', description: 'Date d\'embauche ou d\'intégration au système' }) @IsOptional()
    @IsDateString()
    dateRecrutement?: string;

    @ApiPropertyOptional({ example: 'Bastos, Yaoundé', description: 'Adresse résidentielle de l\'employé' }) @IsOptional()
    @IsString()
    adresse?: string;

    @ApiPropertyOptional({
        example: 350000,
        description: 'Salaire de base de l\'employé en FCFA',
        type: Number
    }) @IsOptional()
    salaireBase?: number;

    @ApiPropertyOptional({
        enum: HoraireEnum,
        example: HoraireEnum.JOUR,
        description: 'Type de rotation ou horaire de travail assigné'
    }) @IsOptional()
    @IsEnum(HoraireEnum)
    typeHoraire?: HoraireEnum;

    @ApiPropertyOptional({ example: 30, description: 'Nombre de jours de congés accordés par an', type: Number }) @IsOptional()
    @IsInt()
    quotaCongesAnnuel?: number;
}

// Pour la mise à jour — email et password exclus du Partial (gérés séparément)
export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['email', 'password'] as const),
) { }

export class ChangePasswordDto {
    @ApiProperty({
        example: 'AncienMotDePasse@123',
        description: 'Le mot de passe actuel de l\'utilisateur, nécessaire pour valider l\'identité avant modification.',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({
        example: 'NouveauMotDePasse@2026',
        minLength: 8,
        description: 'Le nouveau mot de passe. Il doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
        required: true,
    })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
        message: 'Mot de passe trop faible',
    })
    newPassword: string;
}

export class ArchiveUserDto {
    @ApiPropertyOptional({
        description: 'Le motif ou la justification de l\'archivage du compte (ex: Fin de contrat, démission, licenciement). Ce texte sera consigné dans les logs d\'audit.',
        example: 'Fin de contrat de stage',
        required: false,
    })
    @IsOptional()
    @IsString()
    reason?: string;
}
