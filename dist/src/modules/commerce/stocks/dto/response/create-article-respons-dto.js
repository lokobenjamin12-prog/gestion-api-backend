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
exports.CreateArticleResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateArticleResponseDto {
    id;
    stockId;
    message;
    articleName;
    categoryName;
}
exports.CreateArticleResponseDto = CreateArticleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'art_123xyzabc',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article nouvellement créée'
    }),
    __metadata("design:type", String)
], CreateArticleResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'stk_format456def',
        description: 'Identifiant unique de la ligne de stock associée au format initial (très utile pour une redirection immédiate vers la fiche de gestion de stock)'
    }),
    __metadata("design:type", String)
], CreateArticleResponseDto.prototype, "stockId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'L\'article Ndolé Box Premium a été initialisé avec succès avec son format Carton et sa ligne de stock.',
        description: 'Message de confirmation de réussite destiné à être affiché dans une notification Toast sur le frontend'
    }),
    __metadata("design:type", String)
], CreateArticleResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium',
        description: 'Le nom de l\'article créé'
    }),
    __metadata("design:type", String)
], CreateArticleResponseDto.prototype, "articleName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Le nom du format initial ou de la catégorie rattachée au produit'
    }),
    __metadata("design:type", String)
], CreateArticleResponseDto.prototype, "categoryName", void 0);
//# sourceMappingURL=create-article-respons-dto.js.map