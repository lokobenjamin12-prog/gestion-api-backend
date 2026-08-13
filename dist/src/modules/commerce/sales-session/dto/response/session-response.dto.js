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
exports.SessionSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SessionSummaryDto {
    id;
    commercial;
    manager;
    article;
    quantiteDepart;
    quantiteRetour;
    quantiteVendue;
    jourOuverture;
    heureDepart;
    heureRetour;
    totalVentesRecues;
    totalDepenses;
    depenses;
    chiffreAffaireTheorique;
    ecartCaisse;
    status;
}
exports.SessionSummaryDto = SessionSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'sess_999888xyz',
        description: 'Identifiant unique de la session de vente'
    }),
    __metadata("design:type", String)
], SessionSummaryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Informations condensées sur le commercial sur le terrain',
        example: { id: 'usr_comm456', firstName: 'Jean', lastName: 'Kamdem' }
    }),
    __metadata("design:type", Object)
], SessionSummaryDto.prototype, "commercial", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Informations sur le manager qui a supervisé ou ouvert la session',
        example: { id: 'usr_mgr789', firstName: 'Alain', lastName: 'Tchakounté' }
    }),
    __metadata("design:type", Object)
], SessionSummaryDto.prototype, "manager", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Détails du produit/article géré durant cette course',
        example: { nom: 'Ndolé Box Premium', categorie: 'Plats', prixUnite: 3500 }
    }),
    __metadata("design:type", Object)
], SessionSummaryDto.prototype, "article", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50, description: 'Stock initial emporté au départ', type: Number }),
    __metadata("design:type", Number)
], SessionSummaryDto.prototype, "quantiteDepart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Stock invendu rapporté au retour (null si session active)', nullable: true, type: Number }),
    __metadata("design:type", Object)
], SessionSummaryDto.prototype, "quantiteRetour", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'Quantité nette vendue calculée', nullable: true, type: Number }),
    __metadata("design:type", Object)
], SessionSummaryDto.prototype, "quantiteVendue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-06', description: 'Date de l\'ouverture de la session (Format: YYYY-MM-DD)' }),
    __metadata("design:type", String)
], SessionSummaryDto.prototype, "jourOuverture", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-06T08:30:00.000Z', description: 'Timestamp précis du départ effectif' }),
    __metadata("design:type", Date)
], SessionSummaryDto.prototype, "heureDepart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-06T17:30:00.000Z', description: 'Timestamp précis du retour (null si active)', nullable: true }),
    __metadata("design:type", Object)
], SessionSummaryDto.prototype, "heureRetour", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 157500, description: 'Somme totale cumulée des ventes enregistrées', nullable: true, type: Number }),
    __metadata("design:type", Object)
], SessionSummaryDto.prototype, "totalVentesRecues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2500, description: 'Somme totale cumulée des dépenses sur le terrain', type: Number }),
    __metadata("design:type", Number)
], SessionSummaryDto.prototype, "totalDepenses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Liste des lignes de dépenses déclarées pendant la session',
        example: [{ montant: 2500, motif: 'Achat carburant livraison' }],
        type: 'array',
        items: { type: 'object' }
    }),
    __metadata("design:type", Array)
], SessionSummaryDto.prototype, "depenses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 157500, description: 'Chiffre d\'affaires théorique attendu (quantiteVendue * prixUnite)', nullable: true, type: Number }),
    __metadata("design:type", Object)
], SessionSummaryDto.prototype, "chiffreAffaireTheorique", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: 'Écart constaté en caisse (Négatif = Manquant, Positif = Surplus)', nullable: true, type: Number }),
    __metadata("design:type", Object)
], SessionSummaryDto.prototype, "ecartCaisse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CLOSED', description: 'Statut de cycle de vie de la session (OPEN, CLOSED, CANCELLED)' }),
    __metadata("design:type", String)
], SessionSummaryDto.prototype, "status", void 0);
//# sourceMappingURL=session-response.dto.js.map