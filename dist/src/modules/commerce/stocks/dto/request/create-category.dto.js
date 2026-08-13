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
exports.CreateCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCategoryDto {
    nomUnique;
    prixUnite;
    description;
    articleId;
    seuilAlerte;
    seuilCritique;
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Sachet',
        description: 'Nom unique du format de conditionnement ou de la catégorie (ex: Carton, Sachet, Canette)',
        minLength: 2,
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom du format est requis (ex: Carton, Sachet, Douzaine)." }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "nomUnique", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 750,
        description: 'Prix unitaire de vente appliqué à ce format de conditionnement en FCFA',
        minimum: 0,
        type: Number,
        required: true
    }),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: "Le prix unitaire doit être positif." }),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "prixUnite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Conditionnement intermédiaire de 500g destiné à la vente au détail.',
        description: 'Description ou notes complémentaires concernant ce format'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'art_123abc456',
        description: 'Identifiant unique (CUID ou UUID) de l\'article de base associé à ce format',
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'identifiant de l'article est obligatoire pour lier ce format." }),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "articleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 15,
        default: 15,
        description: 'Seuil d\'alerte de stock spécifique pour ce format',
        minimum: 1,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "seuilAlerte", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 5,
        default: 5,
        description: 'Seuil critique de stock spécifique pour ce format',
        minimum: 0,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "seuilCritique", void 0);
//# sourceMappingURL=create-category.dto.js.map