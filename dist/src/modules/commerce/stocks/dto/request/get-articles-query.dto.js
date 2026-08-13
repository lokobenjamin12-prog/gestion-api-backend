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
exports.GetArticlesQueryDto = exports.ArticleStatusFilter = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var ArticleStatusFilter;
(function (ArticleStatusFilter) {
    ArticleStatusFilter["ACTIVE"] = "ACTIVE";
    ArticleStatusFilter["ARCHIVED"] = "ARCHIVED";
    ArticleStatusFilter["ALL"] = "ALL";
})(ArticleStatusFilter || (exports.ArticleStatusFilter = ArticleStatusFilter = {}));
class GetArticlesQueryDto {
    page = 1;
    limit = 10;
    search;
    status = ArticleStatusFilter.ACTIVE;
}
exports.GetArticlesQueryDto = GetArticlesQueryDto;
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
], GetArticlesQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre maximal de références articles à retourner par page',
        default: 10,
        example: 10,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetArticlesQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Recherche textuelle floue sur le nom ou la description de l\'article',
        example: 'Ndolé',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetArticlesQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ArticleStatusFilter,
        default: ArticleStatusFilter.ACTIVE,
        description: 'Filtre d\'état sur l\'objet principal Article (Actifs uniquement, Archivés/Soft-deleted, ou l\'intégralité)',
        example: ArticleStatusFilter.ACTIVE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ArticleStatusFilter),
    __metadata("design:type", String)
], GetArticlesQueryDto.prototype, "status", void 0);
//# sourceMappingURL=get-articles-query.dto.js.map