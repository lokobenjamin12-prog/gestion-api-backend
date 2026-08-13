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
exports.CommerceLogFiltersDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class CommerceLogFiltersDto {
    page = 1;
    limit = 20;
    actorId;
    module;
    action;
    level;
    state;
    entityId;
    dateDebut;
    dateFin;
}
exports.CommerceLogFiltersDto = CommerceLogFiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Numéro de la page à récupérer (commence à 1)',
        default: 1,
        example: 1,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CommerceLogFiltersDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre maximal d\'enregistrements retournés par page (limite de sécurité à 100 max)',
        default: 20,
        example: 20,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CommerceLogFiltersDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtrer par l\'identifiant unique (UUID) de l\'utilisateur qui a effectué l\'action',
        example: 'usr_abc123xyz',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommerceLogFiltersDto.prototype, "actorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.CommerceModule,
        description: 'Filtrer par sous-module commercial de Ndolecam',
        example: 'VENTE',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CommerceModule),
    __metadata("design:type", String)
], CommerceLogFiltersDto.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtrer par le nom de l\'action technique exécutée',
        example: 'CREATE_INVOICE',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommerceLogFiltersDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.LogLevel,
        description: 'Niveau de sévérité du log d\'audit',
        example: 'INFO',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.LogLevel),
    __metadata("design:type", String)
], CommerceLogFiltersDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.State,
        description: 'Statut final de l\'opération commerciale',
        example: 'SUCCESS',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.State),
    __metadata("design:type", String)
], CommerceLogFiltersDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtrer par l\'identifiant de la ressource ciblée (ex: ID d\'une vente, d\'un produit)',
        example: 'fact_789vbn',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommerceLogFiltersDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Borne inférieure de la plage de recherche (Format ISO 8601: YYYY-MM-DD)',
        example: '2026-07-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommerceLogFiltersDto.prototype, "dateDebut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Borne supérieure de la plage de recherche (Format ISO 8601: YYYY-MM-DD)',
        example: '2026-07-06',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommerceLogFiltersDto.prototype, "dateFin", void 0);
//# sourceMappingURL=commerce-log-filters.dto.js.map