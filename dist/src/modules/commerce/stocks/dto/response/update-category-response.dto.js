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
exports.UpdateCategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UpdateCategoryResponseDto {
    id;
    nomUnique;
    prixUnite;
    message;
    updatedAt;
}
exports.UpdateCategoryResponseDto = UpdateCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) de la catégorie / du format modifié'
    }),
    __metadata("design:type", String)
], UpdateCategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Le nom unique mis à jour (ou conservé) du format de conditionnement'
    }),
    __metadata("design:type", String)
], UpdateCategoryResponseDto.prototype, "nomUnique", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12500,
        description: 'Le nouveau prix unitaire appliqué à ce format en FCFA',
        type: Number
    }),
    __metadata("design:type", Number)
], UpdateCategoryResponseDto.prototype, "prixUnite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Le format "Carton" a été mis à jour avec succès.',
        description: 'Message de confirmation destiné à alimenter directement un composant Toast sur le frontend'
    }),
    __metadata("design:type", String)
], UpdateCategoryResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-07T08:49:00.000Z',
        description: 'Timestamp de la transaction généré automatiquement par la clause updatedAt de Prisma dans PostgreSQL'
    }),
    __metadata("design:type", Date)
], UpdateCategoryResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=update-category-response.dto.js.map