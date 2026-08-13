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
exports.GetArticlesResponseDto = void 0;
const article_item_response_dto_1 = require("./article-item-response-dto");
const swagger_1 = require("@nestjs/swagger");
class PaginationMeta {
    total;
    page;
    limit;
    totalPages;
    hasNextPage;
    hasPreviousPage;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 120,
        description: 'Nombre total de références articles correspondant aux filtres appliqués en base'
    }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Index de la page actuelle retournée'
    }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 10,
        description: 'Nombre maximal d\'éléments demandés par page'
    }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12,
        description: 'Nombre total de pages calculé (total / limit arrondi au supérieur)'
    }),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Indique s\'il existe une page suivante disponible'
    }),
    __metadata("design:type", Boolean)
], PaginationMeta.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Indique s\'il existe une page précédente'
    }),
    __metadata("design:type", Boolean)
], PaginationMeta.prototype, "hasPreviousPage", void 0);
class GetArticlesResponseDto {
    data;
    meta;
}
exports.GetArticlesResponseDto = GetArticlesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [article_item_response_dto_1.ArticleItemResponseDto],
        description: 'Tableau contenant les fiches articles condensées de la page courante'
    }),
    __metadata("design:type", Array)
], GetArticlesResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: PaginationMeta,
        description: 'Métadonnées structurelles pour piloter les contrôles de navigation du dashboard'
    }),
    __metadata("design:type", PaginationMeta)
], GetArticlesResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=get-articles-response.dto.js.map