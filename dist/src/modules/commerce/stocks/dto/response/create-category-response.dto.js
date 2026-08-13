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
exports.CreateCategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateCategoryResponseDto {
    id;
    nomUnique;
    articleId;
    stockId;
    message;
}
exports.CreateCategoryResponseDto = CreateCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) de la catégorie ou du format de conditionnement nouvellement créé'
    }),
    __metadata("design:type", String)
], CreateCategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Sachet',
        description: 'Nom unique du format de conditionnement validé'
    }),
    __metadata("design:type", String)
], CreateCategoryResponseDto.prototype, "nomUnique", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'art_789qsd456',
        description: 'Identifiant unique de l\'article de base rattaché'
    }),
    __metadata("design:type", String)
], CreateCategoryResponseDto.prototype, "articleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'stk_format999jkl',
        description: 'Identifiant de la ligne de stock initialisée automatiquement en base pour ce couple article/format'
    }),
    __metadata("design:type", String)
], CreateCategoryResponseDto.prototype, "stockId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Le format Sachet a été ajouté avec succès et sa ligne de stock a été initialisée.',
        description: 'Message de confirmation de réussite destiné à alimenter vos composants de Toast ou alertes sur le dashboard UI'
    }),
    __metadata("design:type", String)
], CreateCategoryResponseDto.prototype, "message", void 0);
//# sourceMappingURL=create-category-response.dto.js.map