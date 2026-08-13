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
exports.RhLogFiltersDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class RhLogFiltersDto {
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
exports.RhLogFiltersDto = RhLogFiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: 'Numéro de la page pour la pagination des logs',
        minimum: 1,
        default: 1,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RhLogFiltersDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 20,
        description: 'Nombre maximal de logs retournés par page (limité à 100)',
        minimum: 1,
        maximum: 100,
        default: 20,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], RhLogFiltersDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'usr_actor123abc',
        description: 'Filtrer par l\'identifiant de l\'utilisateur (auteur) qui a déclenché l\'action'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RhLogFiltersDto.prototype, "actorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.RhModule,
        description: 'Filtrer par module fonctionnel de l\'application (ex: CONTRAT, ABSENCE, DEPARTMENT)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RhModule),
    __metadata("design:type", String)
], RhLogFiltersDto.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'contrat:create',
        description: 'Nom exact de l\'action ou de la permission exécutée'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RhLogFiltersDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.LogLevel,
        description: 'Niveau de sévérité du log (ex: INFO, WARN, ERROR)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.LogLevel),
    __metadata("design:type", String)
], RhLogFiltersDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.State,
        description: 'Statut du cycle de vie ou état de l\'entité (ex: SUCCESS, FAILED)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.State),
    __metadata("design:type", String)
], RhLogFiltersDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'ctr_cldxyz123',
        description: 'Filtrer par l\'identifiant de la ressource ciblée par l\'action (ID du contrat, ID du département, etc.)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RhLogFiltersDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-07-01T00:00:00.000Z',
        description: 'Borne inférieure de la recherche temporelle (format ISO 8601). Les logs retournés seront égaux ou postérieurs à cette date.'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RhLogFiltersDto.prototype, "dateDebut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-07-31T23:59:59.999Z',
        description: 'Borne supérieure de la recherche temporelle (format ISO 8601). Les logs retournés seront égaux ou antérieurs à cette date.'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RhLogFiltersDto.prototype, "dateFin", void 0);
//# sourceMappingURL=rh-log-filters.dto.js.map