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
exports.RestoreCategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class RestoreCategoryResponseDto {
    id;
    nomUnique;
    articleNom;
    message;
}
exports.RestoreCategoryResponseDto = RestoreCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) du format/catégorie qui vient d\'être restauré'
    }),
    __metadata("design:type", String)
], RestoreCategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Nom unique du format de conditionnement réactivé'
    }),
    __metadata("design:type", String)
], RestoreCategoryResponseDto.prototype, "nomUnique", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article parent auquel ce format est à nouveau rattaché'
    }),
    __metadata("design:type", String)
], RestoreCategoryResponseDto.prototype, "articleNom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Le format "Carton" pour l\'article "Ndolé Box Premium" a été restauré avec succès.',
        description: 'Message de succès destiné à être affiché directement dans un Toast d\'information sur le frontend'
    }),
    __metadata("design:type", String)
], RestoreCategoryResponseDto.prototype, "message", void 0);
//# sourceMappingURL=restore-category-response.dto.js.map