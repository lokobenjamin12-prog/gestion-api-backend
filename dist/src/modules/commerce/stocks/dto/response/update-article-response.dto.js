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
exports.UpdateArticleResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UpdateArticleResponseDto {
    id;
    nom;
    updatedAt;
    message;
}
exports.UpdateArticleResponseDto = UpdateArticleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'art_123xyzabc',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article qui a été modifiée'
    }),
    __metadata("design:type", String)
], UpdateArticleResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium - Nouvelle Recette',
        description: 'Le nouveau nom mis à jour pour cet article'
    }),
    __metadata("design:type", String)
], UpdateArticleResponseDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-07T08:48:00.000Z',
        description: 'Timestamp précis de la modification en base PostgreSQL (généré par le champ updatedAt de Prisma)'
    }),
    __metadata("design:type", Date)
], UpdateArticleResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'L\'article a été mis à jour avec succès.',
        description: 'Message de confirmation destiné à être injecté directement dans un composant Toast de notification'
    }),
    __metadata("design:type", String)
], UpdateArticleResponseDto.prototype, "message", void 0);
//# sourceMappingURL=update-article-response.dto.js.map