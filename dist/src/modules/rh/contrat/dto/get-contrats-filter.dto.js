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
exports.GetContratsFilterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class GetContratsFilterDto {
    userId;
    type;
    dateDebutFrom;
    dateDebutTo;
    includeArchived = false;
    page;
    limit;
}
exports.GetContratsFilterDto = GetContratsFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'cldxyz123',
        description: 'Filtrer les contrats pour un collaborateur spécifique (UUID/CUID)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetContratsFilterDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.ContratType,
        example: client_1.ContratType.CDI,
        description: 'Filtrer par nature du contrat (CDI ou CDD)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ContratType),
    __metadata("design:type", String)
], GetContratsFilterDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2024-01-01',
        description: 'Filtrer les contrats dont la date de début est postérieure ou égale à cette date (YYYY-MM-DD)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetContratsFilterDto.prototype, "dateDebutFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2024-01-31',
        description: 'Filtrer les contrats dont la date de début est antérieure ou égale à cette date (YYYY-MM-DD)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetContratsFilterDto.prototype, "dateDebutTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inclure les contrats archivés (soft-deleted) dans les résultats',
        default: false,
        type: Boolean,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GetContratsFilterDto.prototype, "includeArchived", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: 'Numéro de la page pour la pagination',
        minimum: 1,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetContratsFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 10,
        description: 'Nombre maximal d\'éléments renvoyés par page',
        minimum: 1,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetContratsFilterDto.prototype, "limit", void 0);
//# sourceMappingURL=get-contrats-filter.dto.js.map