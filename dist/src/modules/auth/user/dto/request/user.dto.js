"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveUserDto = exports.ChangePasswordDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateUserDto {
    email;
    password;
    firstName;
    lastName;
    phoneNumber;
    whatsappNumber;
    roleId;
    dateNaissance;
    dateRecrutement;
    adresse;
    salaireBase;
    typeHoraire;
    quotaCongesAnnuel;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'alice@entreprise.com',
        description: 'Adresse email professionnelle unique de l\'employé.'
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'MotDePasse@123',
        minLength: 8,
        description: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Alice', description: 'Prénom de l\'employé' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dupont', description: 'Nom de famille de l\'employé' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+237600000000', description: 'Numéro de téléphone principal (format international requis)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+237600000001', description: 'Numéro WhatsApp pour les alertes automatiques de contrats' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "whatsappNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Identifiant unique (ID) du rôle lié aux permissions de l\'utilisateur' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1990-05-15', description: 'Date de naissance (Format ISO 8601 YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "dateNaissance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-01', description: 'Date d\'embauche ou d\'intégration au système' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "dateRecrutement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bastos, Yaoundé', description: 'Adresse résidentielle de l\'employé' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 350000,
        description: 'Salaire de base de l\'employé en FCFA',
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "salaireBase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.HoraireEnum,
        example: client_1.HoraireEnum.JOUR,
        description: 'Type de rotation ou horaire de travail assigné'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.HoraireEnum),
    __metadata("design:type", String)
], CreateUserDto.prototype, "typeHoraire", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30, description: 'Nombre de jours de congés accordés par an', type: Number }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "quotaCongesAnnuel", void 0);
class UpdateUserDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(CreateUserDto, ['email', 'password'])) {
}
exports.UpdateUserDto = UpdateUserDto;
class ChangePasswordDto {
    currentPassword;
    newPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'AncienMotDePasse@123',
        description: 'Le mot de passe actuel de l\'utilisateur, nécessaire pour valider l\'identité avant modification.',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'NouveauMotDePasse@2026',
        minLength: 8,
        description: 'Le nouveau mot de passe. Il doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
        message: 'Mot de passe trop faible',
    }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class ArchiveUserDto {
    reason;
}
exports.ArchiveUserDto = ArchiveUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Le motif ou la justification de l\'archivage du compte (ex: Fin de contrat, démission, licenciement). Ce texte sera consigné dans les logs d\'audit.',
        example: 'Fin de contrat de stage',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ArchiveUserDto.prototype, "reason", void 0);
//# sourceMappingURL=user.dto.js.map