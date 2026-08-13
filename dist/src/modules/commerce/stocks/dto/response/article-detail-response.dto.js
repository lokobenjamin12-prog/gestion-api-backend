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
exports.ArticleDetailResponseDto = exports.StockDetailItem = void 0;
const swagger_1 = require("@nestjs/swagger");
class StockDetailItem {
    stockId;
    format;
    prixUnite;
    quantite;
    niveauAlerte;
    valeurEstimee;
}
exports.StockDetailItem = StockDetailItem;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'stk_format456', description: 'Identifiant unique de la ligne de stock' }),
    __metadata("design:type", String)
], StockDetailItem.prototype, "stockId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Carton', description: 'Nom du format de conditionnement associé (ex: Carton, Sachet)' }),
    __metadata("design:type", String)
], StockDetailItem.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12000, description: 'Prix unitaire du format en FCFA', type: Number }),
    __metadata("design:type", Number)
], StockDetailItem.prototype, "prixUnite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Quantité physique actuellement disponible en entrepôt', type: Number }),
    __metadata("design:type", Number)
], StockDetailItem.prototype, "quantite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'CRITIQUE',
        description: 'Niveau d\'alerte logistique calculé (NORMAL, ALERTE, CRITIQUE)'
    }),
    __metadata("design:type", String)
], StockDetailItem.prototype, "niveauAlerte", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 180000,
        description: 'Valeur financière estimée du stock pour ce format (quantite * prixUnite)',
        type: Number
    }),
    __metadata("design:type", Number)
], StockDetailItem.prototype, "valeurEstimee", void 0);
class ArticleDetailResponseDto {
    id;
    nom;
    createdAt;
    isArchived;
    archivedAt;
    canMoveStock;
    detailsStock;
    quantiteTotale;
}
exports.ArticleDetailResponseDto = ArticleDetailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'art_123xyzabc', description: 'Identifiant unique de la référence de base de l\'article' }),
    __metadata("design:type", String)
], ArticleDetailResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ndolé Box Premium', description: 'Nom de l\'article de base' }),
    __metadata("design:type", String)
], ArticleDetailResponseDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-15T08:00:00.000Z', description: 'Date de création de la référence en base' }),
    __metadata("design:type", Date)
], ArticleDetailResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Indique si l\'article a subi un archivage logique (soft-delete)'
    }),
    __metadata("design:type", Boolean)
], ArticleDetailResponseDto.prototype, "isArchived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: null,
        description: 'Date précise de l\'archivage (null si l\'article est actif)',
        nullable: true
    }),
    __metadata("design:type", Object)
], ArticleDetailResponseDto.prototype, "archivedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Indique si l\'article est éligible à des mouvements de stock (devient false si archivé ou verrouillé)'
    }),
    __metadata("design:type", Boolean)
], ArticleDetailResponseDto.prototype, "canMoveStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [StockDetailItem],
        description: 'Décomposition des stocks et états financiers par format de conditionnement'
    }),
    __metadata("design:type", Array)
], ArticleDetailResponseDto.prototype, "detailsStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 45,
        description: 'Somme cumulée de toutes les unités physiques, tous formats confondus',
        type: Number
    }),
    __metadata("design:type", Number)
], ArticleDetailResponseDto.prototype, "quantiteTotale", void 0);
//# sourceMappingURL=article-detail-response.dto.js.map