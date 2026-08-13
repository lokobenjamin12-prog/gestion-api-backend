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
exports.ArticleItemResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ArticleItemResponseDto {
    id;
    nom;
    createdAt;
    isArchived;
    formats;
    quantiteTotale;
    valeurTotale;
    enAlerte;
}
exports.ArticleItemResponseDto = ArticleItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'art_123xyzabc',
        description: 'Identifiant unique de la référence de base de l\'article'
    }),
    __metadata("design:type", String)
], ArticleItemResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article'
    }),
    __metadata("design:type", String)
], ArticleItemResponseDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-05-15T08:00:00.000Z',
        description: 'Date de création de l\'article en base'
    }),
    __metadata("design:type", Date)
], ArticleItemResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Indique si l\'article est actuellement archivé logiquement (soft-delete)'
    }),
    __metadata("design:type", Boolean)
], ArticleItemResponseDto.prototype, "isArchived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Carton', 'Sachet', 'Pot'],
        description: 'Liste des noms de formats ou catégories de conditionnement existants et actifs pour cet article',
        type: [String]
    }),
    __metadata("design:type", Array)
], ArticleItemResponseDto.prototype, "formats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 250,
        description: 'Somme cumulée des quantités physiques disponibles, tous formats confondus',
        type: Number
    }),
    __metadata("design:type", Number)
], ArticleItemResponseDto.prototype, "quantiteTotale", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 375000,
        description: 'Valeur financière totale estimée du stock en magasin pour cet article (Somme de: quantité × prixUnite du format) en FCFA',
        type: Number
    }),
    __metadata("design:type", Number)
], ArticleItemResponseDto.prototype, "valeurTotale", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Drapeau d\'alerte global : passe à true si au moins un des formats de l\'article a franchi son seuil d\'alerte ou critique'
    }),
    __metadata("design:type", Boolean)
], ArticleItemResponseDto.prototype, "enAlerte", void 0);
//# sourceMappingURL=article-item-response-dto.js.map