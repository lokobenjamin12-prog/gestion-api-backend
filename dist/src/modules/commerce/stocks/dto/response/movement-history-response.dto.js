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
exports.MovementHistoryResponseDto = exports.MovementItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class MovementItemDto {
    id;
    type;
    quantite;
    avant;
    apres;
    motif;
    date;
    isSystem;
    articleId;
    articleNom;
    categoryNom;
    auteur;
}
exports.MovementItemDto = MovementItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'mvt_123xyz789',
        description: 'Identifiant unique (UUID/CUID) du mouvement de stock enregistré'
    }),
    __metadata("design:type", String)
], MovementItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ENTREE',
        enum: ['ENTREE', 'SORTIE', 'AJUSTEMENT'],
        description: 'Nature du flux physique ou logique appliqué au stock'
    }),
    __metadata("design:type", String)
], MovementItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50,
        description: 'Quantité d\'unités absolues ayant transité lors de ce mouvement',
        type: Number
    }),
    __metadata("design:type", Number)
], MovementItemDto.prototype, "quantite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 120,
        description: 'Niveau physique du stock disponible IMMÉDIATEMENT AVANT le calcul du mouvement',
        type: Number
    }),
    __metadata("design:type", Number)
], MovementItemDto.prototype, "avant", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 170,
        description: 'Niveau physique du stock disponible IMMÉDIATEMENT APRÈS la validation du mouvement (avant + quantite)',
        type: Number
    }),
    __metadata("design:type", Number)
], MovementItemDto.prototype, "apres", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Livraison fournisseur mensuelle - Facture #NF2026-99',
        description: 'Raison ou contexte métier justifiant l\'opération sur l\'inventaire'
    }),
    __metadata("design:type", String)
], MovementItemDto.prototype, "motif", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-07T08:33:00.000Z',
        description: 'Date et heure de l\'écriture ou de l\'application comptable du mouvement'
    }),
    __metadata("design:type", Date)
], MovementItemDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Passe à true si l\'opération est automatisée par le système (ex: vente e-commerce, annulation automatique) ou false si saisie manuelle'
    }),
    __metadata("design:type", Boolean)
], MovementItemDto.prototype, "isSystem", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'art_ndole456',
        description: 'Identifiant de l\'article racine concerné'
    }),
    __metadata("design:type", String)
], MovementItemDto.prototype, "articleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article au moment du mouvement'
    }),
    __metadata("design:type", String)
], MovementItemDto.prototype, "articleNom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Nom du format de conditionnement ou de la catégorie touchée'
    }),
    __metadata("design:type", String)
], MovementItemDto.prototype, "categoryNom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Heidi Minaj',
        description: 'Identité complète (Prénom et Nom) de l\'agent ou de l\'administrateur à l\'origine du flux'
    }),
    __metadata("design:type", String)
], MovementItemDto.prototype, "auteur", void 0);
class MovementHistoryResponseDto {
    data;
    meta;
}
exports.MovementHistoryResponseDto = MovementHistoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [MovementItemDto],
        description: 'Tableau chronologique contenant les lignes d\'audit de stock pour la page courante'
    }),
    __metadata("design:type", Array)
], MovementHistoryResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Métadonnées de pagination spécifiques pour caler vos tableaux ou graphes de flux logistiques',
        example: {
            totalItems: 1450,
            itemCount: 10,
            itemsPerPage: 10,
            totalPages: 145,
            currentPage: 1
        }
    }),
    __metadata("design:type", Object)
], MovementHistoryResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=movement-history-response.dto.js.map