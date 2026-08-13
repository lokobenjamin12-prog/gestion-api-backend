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
exports.DeleteArticleResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class DeleteArticleResponseDto {
    id;
    message;
    deletedAt;
}
exports.DeleteArticleResponseDto = DeleteArticleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'art_123xyzabc',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article qui vient d\'être archivée logiquement'
    }),
    __metadata("design:type", String)
], DeleteArticleResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'L\'article a été archivé avec succès.',
        description: 'Message de confirmation de la suppression logique, prêt à être consommé par un composant Toast sur le frontend'
    }),
    __metadata("design:type", String)
], DeleteArticleResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-07T08:44:00.000Z',
        description: 'Timestamp précis de l\'exécution de la suppression logique (mise à jour du champ deletedAt dans PostgreSQL)'
    }),
    __metadata("design:type", Date)
], DeleteArticleResponseDto.prototype, "deletedAt", void 0);
//# sourceMappingURL=soft-delete-article-response.dto.js.map