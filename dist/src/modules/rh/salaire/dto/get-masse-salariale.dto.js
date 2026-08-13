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
exports.GetMasseSalarialeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class GetMasseSalarialeDto {
    mois;
    annee;
    page = 1;
    limit = 50;
}
exports.GetMasseSalarialeDto = GetMasseSalarialeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 7,
        description: 'Le numéro du mois ciblé pour le calcul de la masse salariale (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], GetMasseSalarialeDto.prototype, "mois", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2026,
        description: 'L\'année civile ciblée pour le calcul de la masse salariale',
        minimum: 2000,
        type: Number
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], GetMasseSalarialeDto.prototype, "annee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: 'Numéro de la page demandée pour l\'affichage des lignes d\'agrégation',
        minimum: 1,
        default: 1,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetMasseSalarialeDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 50,
        description: 'Nombre maximal de lignes de détails renvoyées par page (limité à 100)',
        minimum: 1,
        maximum: 100,
        default: 50,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetMasseSalarialeDto.prototype, "limit", void 0);
//# sourceMappingURL=get-masse-salariale.dto.js.map