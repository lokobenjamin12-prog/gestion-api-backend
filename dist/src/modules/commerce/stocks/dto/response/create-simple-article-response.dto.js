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
exports.CreateSimpleArticleResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateSimpleArticleResponseDto {
    id;
    nom;
    message;
    createdAt;
}
exports.CreateSimpleArticleResponseDto = CreateSimpleArticleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'art_brut111xyz',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article de base créée'
    }),
    __metadata("design:type", String)
], CreateSimpleArticleResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Premium Brut',
        description: 'Nom de la référence d\'article enregistré en base'
    }),
    __metadata("design:type", String)
], CreateSimpleArticleResponseDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'La référence d\'article "Ndolé Premium Brut" a été enregistrée avec succès.',
        description: 'Message de succès destiné à être affiché directement dans une notification sur le client'
    }),
    __metadata("design:type", String)
], CreateSimpleArticleResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-06T18:20:00.000Z',
        description: 'Timestamp précis de la création de la ligne en base PostgreSQL'
    }),
    __metadata("design:type", Date)
], CreateSimpleArticleResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=create-simple-article-response.dto.js.map