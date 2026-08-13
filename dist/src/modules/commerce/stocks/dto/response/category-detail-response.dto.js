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
exports.CategoryDetailResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CategoryDetailResponseDto {
    id;
    nomFormat;
    description;
    prixUnite;
    article;
    stock;
}
exports.CategoryDetailResponseDto = CategoryDetailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique de la catégorie ou du format de conditionnement'
    }),
    __metadata("design:type", String)
], CategoryDetailResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Nom unique du format de conditionnement (ex: Carton, Sachet, Douzaine)'
    }),
    __metadata("design:type", String)
], CategoryDetailResponseDto.prototype, "nomFormat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Emballage renforcé contenant 24 unités de produit, idéal pour la vente en gros.',
        description: 'Description ou notes complémentaires sur l\'usage de ce format',
        nullable: true
    }),
    __metadata("design:type", Object)
], CategoryDetailResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12000,
        description: 'Prix unitaire appliqué pour ce format spécifique en FCFA',
        type: Number
    }),
    __metadata("design:type", Number)
], CategoryDetailResponseDto.prototype, "prixUnite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Informations condensées sur l\'article de base propriétaire de ce format',
        example: { nom: 'Ndolé Box Premium' }
    }),
    __metadata("design:type", Object)
], CategoryDetailResponseDto.prototype, "article", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'État actuel des stocks et indicateurs logistiques pour ce format d\'emballage (null si aucun stock n\'est initialisé)',
        nullable: true,
        example: { id: 'stk_999888', quantiteActuelle: 45, niveauAlerte: 'NORMAL' }
    }),
    __metadata("design:type", Object)
], CategoryDetailResponseDto.prototype, "stock", void 0);
//# sourceMappingURL=category-detail-response.dto.js.map