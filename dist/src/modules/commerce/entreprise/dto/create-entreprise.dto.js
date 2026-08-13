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
exports.CreateEntrepriseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateEntrepriseDto {
    nom;
    adresse;
    telephone;
    email;
}
exports.CreateEntrepriseDto = CreateEntrepriseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Société Exemple SARL',
        description: 'Nom officiel de l\'entreprise — apparaît sur les fiches de paie et les contrats',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateEntrepriseDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Bastos, Yaoundé, Cameroun',
        description: 'Adresse physique ou siège complet de l\'entreprise',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepriseDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '+237600000000',
        description: 'Numéro de téléphone principal de la structure (format international recommandé)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepriseDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'contact@entreprise.com',
        description: 'Adresse email de contact ou de support de l\'entreprise',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateEntrepriseDto.prototype, "email", void 0);
//# sourceMappingURL=create-entreprise.dto.js.map