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
exports.PaginatedCategoryResponseDto = exports.CategoryItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CategoryItemDto {
    id;
    nomUnique;
    prixUnite;
    description;
    quantiteDisponible;
    alerte;
    article;
}
exports.CategoryItemDto = CategoryItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique de la catégorie ou du format de conditionnement'
    }),
    __metadata("design:type", String)
], CategoryItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Sachet',
        description: 'Nom unique du format de conditionnement'
    }),
    __metadata("design:type", String)
], CategoryItemDto.prototype, "nomUnique", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 750,
        description: 'Prix unitaire appliqué pour ce format en FCFA',
        type: Number
    }),
    __metadata("design:type", Number)
], CategoryItemDto.prototype, "prixUnite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Format économique individuel',
        description: 'Notes ou description du format (null si non renseigné)',
        nullable: true
    }),
    __metadata("design:type", Object)
], CategoryItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 120,
        description: 'Quantité physique actuellement disponible en stock pour ce format d\'emballage',
        type: Number
    }),
    __metadata("design:type", Number)
], CategoryItemDto.prototype, "quantiteDisponible", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'NORMAL',
        description: 'Statut de l\'alerte de stock calculé pour ce format (NORMAL, ALERTE, CRITIQUE)'
    }),
    __metadata("design:type", String)
], CategoryItemDto.prototype, "alerte", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Informations de base sur l\'article rattaché',
        example: { id: 'art_789qsd', nom: 'Ndolé Box Premium' }
    }),
    __metadata("design:type", Object)
], CategoryItemDto.prototype, "article", void 0);
class PaginatedCategoryResponseDto {
    data;
    meta;
}
exports.PaginatedCategoryResponseDto = PaginatedCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [CategoryItemDto],
        description: 'Liste des lignes de formats/catégories correspondant aux critères de la page courante'
    }),
    __metadata("design:type", Array)
], PaginatedCategoryResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Métadonnées de pagination pour piloter l\'affichage des boutons de navigation côté frontend',
        example: {
            total: 45,
            page: 1,
            limit: 10,
            totalPages: 5,
            hasNextPage: true,
            hasPreviousPage: false
        }
    }),
    __metadata("design:type", Object)
], PaginatedCategoryResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=category-list-response.dto.js.map