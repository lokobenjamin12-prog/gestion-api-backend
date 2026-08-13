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
exports.DeleteCategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class DeleteCategoryResponseDto {
    id;
    nomUnique;
    message;
    archivedAt;
}
exports.DeleteCategoryResponseDto = DeleteCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) de la catégorie ou du format qui vient d\'être traité'
    }),
    __metadata("design:type", String)
], DeleteCategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Nom unique du format/catégorie archivé ou supprimé'
    }),
    __metadata("design:type", String)
], DeleteCategoryResponseDto.prototype, "nomUnique", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'La catégorie "Carton" a été archivée avec succès.',
        description: 'Message de confirmation de l\'opération destiné à alimenter un Toast d\'information'
    }),
    __metadata("design:type", String)
], DeleteCategoryResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-06T18:25:00.000Z',
        description: 'Timestamp précis de l\'exécution de l\'archivage logique (ou de la purge effective)'
    }),
    __metadata("design:type", Date)
], DeleteCategoryResponseDto.prototype, "archivedAt", void 0);
//# sourceMappingURL=delete-category-response.dto.js.map