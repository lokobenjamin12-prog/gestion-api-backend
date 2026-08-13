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
exports.AuthLogFiltersDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class AuthLogFiltersDto {
    page = 1;
    limit = 20;
    actorId;
    module;
    action;
    level;
    state;
    reason;
    email;
    dateDebut;
    dateFin;
}
exports.AuthLogFiltersDto = AuthLogFiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Numéro de la page à récupérer',
        example: 1,
        default: 1,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AuthLogFiltersDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre d\'éléments par page (Maximum 100)',
        example: 20,
        default: 20,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], AuthLogFiltersDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Identifiant unique de l\'acteur (utilisateur connecté) à l\'origine de l\'action',
        example: 'usr_lmlk89210',
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthLogFiltersDto.prototype, "actorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sous-module d\'authentification concerné',
        enum: client_1.AuthModule,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AuthModule),
    __metadata("design:type", String)
], AuthLogFiltersDto.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nom de l\'action ou de la fonction système exécutée',
        example: 'auth.login.success',
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthLogFiltersDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Niveau de sévérité du log',
        enum: client_1.LogLevel,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.LogLevel),
    __metadata("design:type", String)
], AuthLogFiltersDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Statut du résultat de l\'action',
        enum: client_1.State,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.State),
    __metadata("design:type", String)
], AuthLogFiltersDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Raison ou motif lié au statut de l\'action',
        enum: client_1.Reason,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Reason),
    __metadata("design:type", String)
], AuthLogFiltersDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtrer les lignes par adresse email ciblée ou concernée',
        example: 'heidi.dev@ndolecam.com',
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthLogFiltersDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Date de début de recherche au format ISO',
        example: '2026-01-01',
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthLogFiltersDto.prototype, "dateDebut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Date de fin de recherche au format ISO',
        example: '2026-12-31',
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthLogFiltersDto.prototype, "dateFin", void 0);
//# sourceMappingURL=auth-log-filters.dto.js.map