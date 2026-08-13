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
exports.GetSessionsFilterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class GetSessionsFilterDto {
    status;
    jourOuverture;
    page = 1;
    limit = 20;
}
exports.GetSessionsFilterDto = GetSessionsFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.SessionStatus,
        description: 'Filtrer les sessions de vente par leur statut actuel',
        example: client_1.SessionStatus.OPEN,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SessionStatus),
    __metadata("design:type", String)
], GetSessionsFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filtrer les sessions ouvertes lors d\'un jour spécifique (Format: YYYY-MM-DD)',
        example: '2026-07-06',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetSessionsFilterDto.prototype, "jourOuverture", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Index de la page à récupérer',
        default: 1,
        example: 1,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetSessionsFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre maximal d\'enregistrements à retourner par page',
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
], GetSessionsFilterDto.prototype, "limit", void 0);
//# sourceMappingURL=get-sessions-filter.dto.js.map