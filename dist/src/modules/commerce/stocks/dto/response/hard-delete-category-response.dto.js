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
exports.HardDeleteCategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class HardDeleteCategoryResponseDto {
    id;
    nomUnique;
    articleNom;
    message;
    deletedAt;
}
exports.HardDeleteCategoryResponseDto = HardDeleteCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cat_abc123xyz',
        description: 'Identifiant unique (UUID/CUID) du format/catégorie qui vient d\'être définitivement purgé de la base'
    }),
    __metadata("design:type", String)
], HardDeleteCategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Carton',
        description: 'Nom unique du format de conditionnement supprimé'
    }),
    __metadata("design:type", String)
], HardDeleteCategoryResponseDto.prototype, "nomUnique", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article parent auquel ce format était rattaché'
    }),
    __metadata("design:type", String)
], HardDeleteCategoryResponseDto.prototype, "articleNom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Le format "Carton" rattaché à l\'article "Ndolé Box Premium" a été définitivement supprimé du système.',
        description: 'Message de confirmation de la purge complète destiné à alimenter vos alertes ou notifications de type Toast'
    }),
    __metadata("design:type", String)
], HardDeleteCategoryResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-07T08:30:00.000Z',
        description: 'Timestamp de l\'exécution de l\'opération de suppression physique dans PostgreSQL'
    }),
    __metadata("design:type", Date)
], HardDeleteCategoryResponseDto.prototype, "deletedAt", void 0);
//# sourceMappingURL=hard-delete-category-response.dto.js.map