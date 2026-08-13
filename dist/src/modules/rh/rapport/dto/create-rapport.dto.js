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
exports.CreateRapportDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class CreateRapportDto {
    type;
    mois;
    annee;
    userId;
    formatExport;
    page = 1;
    limit = 50;
}
exports.CreateRapportDto = CreateRapportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.RapportType,
        example: client_1.RapportType.ABSENCES,
        description: 'La nature thématique du rapport à compiler (ABSENCES, MASSE_SALARIALE, ou CONTRATS_CDD)'
    }),
    (0, class_validator_1.IsEnum)(client_1.RapportType, {
        message: "Le type de rapport fourni n'est pas valide. Il doit être soit ABSENCES, soit MASSE_SALARIALE, soit CONTRATS_CDD"
    }),
    __metadata("design:type", String)
], CreateRapportDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 7,
        description: 'Filtrer les données du rapport sur un mois spécifique (1 à 12). Optionnel.',
        minimum: 1,
        maximum: 12,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: "Le mois doit être un nombre." }),
    (0, class_validator_1.Min)(1, { message: "Le mois doit être compris entre 1 et 12." }),
    (0, class_validator_1.Max)(12, { message: "Le mois doit être compris entre 1 et 12." }),
    __metadata("design:type", Number)
], CreateRapportDto.prototype, "mois", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 2026,
        description: 'Filtrer les données du rapport sur une année spécifique (Fenêtre : 2026 - 2030). Optionnel.',
        minimum: 2026,
        maximum: 2030,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: "L'année doit être un nombre." }),
    (0, class_validator_1.Min)(2026, { message: "L'année minimale supportée est 2020." }),
    (0, class_validator_1.Max)(2030, { message: "L'année ne peut pas être dans le futur." }),
    __metadata("design:type", Number)
], CreateRapportDto.prototype, "annee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'usr_employee123',
        description: 'Cibler un collaborateur unique pour l\'extraction des données (UUID/CUID). Optionnel.'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "L'identifiant de l'utilisateur doit être une chaîne de caractères." }),
    __metadata("design:type", String)
], CreateRapportDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.ExportFormat,
        example: client_1.ExportFormat.PDF,
        description: 'Format de rendu physique du document généré (PDF ou EXCEL)'
    }),
    (0, class_validator_1.IsEnum)(client_1.ExportFormat, {
        message: "Le format d'export doit être PDF ou EXCEL."
    }),
    __metadata("design:type", String)
], CreateRapportDto.prototype, "formatExport", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: 'Numéro de la page de données à inclure dans le rapport global',
        minimum: 1,
        default: 1,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: "La page doit être supérieure ou égale à 1." }),
    __metadata("design:type", Number)
], CreateRapportDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 50,
        description: 'Nombre maximal de lignes de données compilées par page de document (Sécurité anti-crash fixée à 250)',
        minimum: 1,
        maximum: 250,
        default: 50,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(250, { message: "Vous ne pouvez pas demander plus de 250 lignes par page." }),
    __metadata("design:type", Number)
], CreateRapportDto.prototype, "limit", void 0);
//# sourceMappingURL=create-rapport.dto.js.map