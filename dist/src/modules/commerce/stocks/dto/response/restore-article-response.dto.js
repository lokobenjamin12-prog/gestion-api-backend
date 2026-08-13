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
exports.RestoreArticleResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class RestoreArticleResponseDto {
    id;
    nom;
    message;
    restoredAt;
}
exports.RestoreArticleResponseDto = RestoreArticleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'art_123xyzabc',
        description: 'Identifiant unique (UUID/CUID) de la référence d\'article qui vient d\'être restaurée'
    }),
    __metadata("design:type", String)
], RestoreArticleResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Box Premium',
        description: 'Nom de l\'article réactivé'
    }),
    __metadata("design:type", String)
], RestoreArticleResponseDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'L\'article "Ndolé Box Premium" a été restauré avec succès et est de nouveau actif.',
        description: 'Message de succès destiné à alimenter une notification Toast sur votre interface utilisateur'
    }),
    __metadata("design:type", String)
], RestoreArticleResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-07T08:43:00.000Z',
        description: 'Timestamp précis confirmant l\'instant de la réactivation de l\'élément en base PostgreSQL'
    }),
    __metadata("design:type", Date)
], RestoreArticleResponseDto.prototype, "restoredAt", void 0);
//# sourceMappingURL=restore-article-response.dto.js.map