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
exports.StockOverviewItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class StockAlerteStyleDto {
    label;
    color;
    message;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Critique',
        description: 'Label textuel formaté pour être affiché dans un badge'
    }),
    __metadata("design:type", String)
], StockAlerteStyleDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '#EF4444',
        description: 'Code couleur hexadécimal ou classe utilitaire (ex: red-500) pour piloter directement le style CSS/Tailwind ou Flutter'
    }),
    __metadata("design:type", String)
], StockAlerteStyleDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Seuil critique atteint. Commande fournisseur urgente.',
        description: 'Message d\'avertissement logistique détaillé'
    }),
    __metadata("design:type", String)
], StockAlerteStyleDto.prototype, "message", void 0);
class StockOverviewItemDto {
    stockId;
    nomArticle;
    categoryNom;
    prixUnitaireCategory;
    quantite;
    niveauAlerte;
    valeurStock;
    alerte;
}
exports.StockOverviewItemDto = StockOverviewItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'stk_overview789xyz',
        description: 'Identifiant unique de la ligne d\'inventaire associée'
    }),
    __metadata("design:type", String)
], StockOverviewItemDto.prototype, "stockId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium',
        description: 'Nom de la référence d\'article'
    }),
    __metadata("design:type", String)
], StockOverviewItemDto.prototype, "nomArticle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Nom du format de conditionnement ou de la catégorie'
    }),
    __metadata("design:type", String)
], StockOverviewItemDto.prototype, "categoryNom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12000,
        description: 'Prix unitaire appliqué pour ce format spécifique en FCFA',
        type: Number
    }),
    __metadata("design:type", Number)
], StockOverviewItemDto.prototype, "prixUnitaireCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 3,
        description: 'Quantité physique actuellement disponible en magasin',
        type: Number
    }),
    __metadata("design:type", Number)
], StockOverviewItemDto.prototype, "quantite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'CRITICAL',
        enum: ['NORMAL', 'LOW', 'CRITICAL'],
        description: 'Indicateur standardisé du niveau de sécurité du stock'
    }),
    __metadata("design:type", String)
], StockOverviewItemDto.prototype, "niveauAlerte", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 36000,
        description: 'Valeur financière totale du stock pour ce format (quantite × prixUnitaireCategory) en FCFA',
        type: Number
    }),
    __metadata("design:type", Number)
], StockOverviewItemDto.prototype, "valeurStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: StockAlerteStyleDto,
        description: 'Configuration esthétique et textuelle de l\'alerte pour l\'interface utilisateur'
    }),
    __metadata("design:type", StockAlerteStyleDto)
], StockOverviewItemDto.prototype, "alerte", void 0);
//# sourceMappingURL=stock-overview-response.dto.js.map