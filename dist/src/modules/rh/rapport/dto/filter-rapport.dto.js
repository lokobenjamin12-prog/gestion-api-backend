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
exports.FilterRapportDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class FilterRapportDto {
    type;
    userId;
    mois;
    annee;
    includeArchived = false;
    page = 1;
    limit = 50;
}
exports.FilterRapportDto = FilterRapportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.RapportType,
        description: 'Filtrer l\'historique par nature thématique du rapport (ABSENCES, MASSE_SALARIALE, CONTRATS_CDD)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RapportType, {
        message: "Le type de rapport fourni n'est pas valide.",
    }),
    __metadata("design:type", String)
], FilterRapportDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'usr_employee123',
        description: 'Filtrer les rapports générés spécifiquement pour ou par un collaborateur (UUID/CUID)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "L'identifiant de l'utilisateur doit être un texte." }),
    __metadata("design:type", String)
], FilterRapportDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 7,
        description: 'Filtrer par mois de validité du rapport (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: "Le mois doit être un nombre." }),
    (0, class_validator_1.Min)(1, { message: "Le mois doit être entre 1 et 12." }),
    (0, class_validator_1.Max)(12, { message: "Le mois doit être entre 1 et 12." }),
    __metadata("design:type", Number)
], FilterRapportDto.prototype, "mois", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 2026,
        description: 'Filtrer par année de validité du rapport (Historique disponible : 2020 - 2026)',
        minimum: 2020,
        maximum: 2026,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: "L'année doit être un nombre." }),
    (0, class_validator_1.Min)(2020, { message: "L'année minimale supportée est 2020." }),
    (0, class_validator_1.Max)(2026, { message: "L'année ne peut pas être dans le futur." }),
    __metadata("design:type", Number)
], FilterRapportDto.prototype, "annee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: false,
        description: 'Si positionné à true, inclut également les rapports placés dans la corbeille (soft deleted)',
        default: false,
        type: Boolean
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FilterRapportDto.prototype, "includeArchived", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: 'Numéro de la page demandée pour l\'affichage de l\'historique',
        minimum: 1,
        default: 1,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: "La page doit être un nombre entier." }),
    (0, class_validator_1.Min)(1, { message: "Le numéro de page minimum est 1." }),
    __metadata("design:type", Number)
], FilterRapportDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 50,
        description: 'Nombre maximal d\'entrées d\'historique renvoyées par page (maximum : 100)',
        minimum: 1,
        maximum: 100,
        default: 50,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: "La limite doit être un nombre entier." }),
    (0, class_validator_1.Min)(1, { message: "La limite minimale est de 1 ligne." }),
    (0, class_validator_1.Max)(100, { message: "Vous ne pouvez pas demander plus de 100 lignes par page." }),
    __metadata("design:type", Number)
], FilterRapportDto.prototype, "limit", void 0);
//# sourceMappingURL=filter-rapport.dto.js.map