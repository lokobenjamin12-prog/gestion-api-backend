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
exports.StockAlertResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class StockAlertResponseDto {
    id;
    quantiteActuelle;
    niveauAlerte;
    nomArticle;
    format;
    prixUnite;
    messageLogistique;
    isUrgent;
}
exports.StockAlertResponseDto = StockAlertResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'stk_alert111xyz',
        description: 'Identifiant unique de la ligne de stock ou de l\'alerte'
    }),
    __metadata("design:type", String)
], StockAlertResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Quantité physique actuellement disponible en entrepôt',
        type: Number
    }),
    __metadata("design:type", Number)
], StockAlertResponseDto.prototype, "quantiteActuelle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'CRITIQUE',
        description: 'Niveau de sévérité de l\'alerte calculé par le système (ex: ALERTE, CRITIQUE)'
    }),
    __metadata("design:type", String)
], StockAlertResponseDto.prototype, "niveauAlerte", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article concerné'
    }),
    __metadata("design:type", String)
], StockAlertResponseDto.prototype, "nomArticle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Format de conditionnement ou catégorie rattachée'
    }),
    __metadata("design:type", String)
], StockAlertResponseDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12000,
        description: 'Prix unitaire appliqué à ce format en FCFA',
        type: Number
    }),
    __metadata("design:type", Number)
], StockAlertResponseDto.prototype, "prixUnite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Attention : Le stock de "Ndolé Box Premium (Carton)" est presque épuisé (5 unités restantes). Réapprovisionnement immédiat requis.',
        description: 'Message contextuel généré pour le rapport logistique ou l\'affichage textuel'
    }),
    __metadata("design:type", String)
], StockAlertResponseDto.prototype, "messageLogistique", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Indicateur de priorité absolue. Si true, permet au frontend d\'activer des effets visuels prioritaires (icônes clignotantes, lignes rouges, notifications push)'
    }),
    __metadata("design:type", Boolean)
], StockAlertResponseDto.prototype, "isUrgent", void 0);
//# sourceMappingURL=stock-alert-response.dto.js.map