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
exports.CreateArticleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateArticleDto {
    nom;
    description;
    nomUniqueCategory;
    prixUnite;
    seuilAlerte;
    seuilCritique;
}
exports.CreateArticleDto = CreateArticleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium',
        description: 'Nom unique de la référence de base de l\'article',
        minLength: 3,
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom est requis" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: "Le nom de l'article doit contenir au moins 3 caractères." }),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Plat traditionnel de ndolé précuit et conditionné sous vide sous format premium.',
        description: 'Description détaillée du produit ou caractéristiques spécifiques',
        minLength: 5
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Nom du format d\'emballage ou de la catégorie initiale (ex: Sachet, Carton, Bouteille)',
        required: true
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom du format initial est requis (ex: Sachet, Carton)." }),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "nomUniqueCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 15000,
        description: 'Prix unitaire appliqué pour ce format spécifique en FCFA',
        minimum: 0,
        type: Number,
        required: true
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: "Le prix unitaire ne peut pas être négatif." }),
    __metadata("design:type", Number)
], CreateArticleDto.prototype, "prixUnite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 20,
        default: 20,
        description: 'Seuil d\'alerte de stock (génère une notification préventive)',
        minimum: 1,
        type: Number
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: "Le seuil d'alerte doit être au moins de 1" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateArticleDto.prototype, "seuilAlerte", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 10,
        default: 10,
        description: 'Seuil critique de stock (indique une rupture imminente nécessitant un approvisionnement urgent)',
        minimum: 0,
        type: Number
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: "Le seuil critique ne peut pas être négatif" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateArticleDto.prototype, "seuilCritique", void 0);
//# sourceMappingURL=create-article.dto.js.map