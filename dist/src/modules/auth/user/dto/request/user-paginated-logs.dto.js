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
exports.PaginatedLogsDto = exports.LogResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class LogResponseDto {
    id;
    action;
    module;
    message;
    state;
    createdAt;
}
exports.LogResponseDto = LogResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'log_abc123xyz',
        description: 'Identifiant unique de la ligne de log d\'audit'
    }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'SEARCH_USER_BY_EMAIL',
        description: 'Action technique exécutée par l\'acteur'
    }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'USER',
        description: 'Module applicatif concerné par l\'action'
    }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Recherche de l\'utilisateur par email : heidi.dev@ndolecam.com',
        description: 'Message contextuel descriptif de l\'événement'
    }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'SUCCESS',
        description: 'Statut final de l\'opération (ex: SUCCESS, FAILED)'
    }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-06T14:30:00.000Z',
        description: 'Date et heure de création de l\'enregistrement'
    }),
    __metadata("design:type", Date)
], LogResponseDto.prototype, "createdAt", void 0);
class PaginationMetaDto {
    total;
    page;
    lastPage;
    limit;
    hasNextPage;
    hasPrevPage;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 142, description: 'Nombre total d\'enregistrements correspondants au filtre' }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Index de la page actuelle' }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8, description: 'Numéro de la dernière page disponible' }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "lastPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20, description: 'Nombre maximum d\'éléments retournés par page' }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Indique s\'il existe une page suivante' }),
    __metadata("design:type", Boolean)
], PaginationMetaDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Indique s\'il existe une page précédente' }),
    __metadata("design:type", Boolean)
], PaginationMetaDto.prototype, "hasPrevPage", void 0);
class PaginatedLogsDto {
    data;
    meta;
}
exports.PaginatedLogsDto = PaginatedLogsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [LogResponseDto],
        description: 'Liste des logs d\'audit de la page courante'
    }),
    __metadata("design:type", Array)
], PaginatedLogsDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: PaginationMetaDto,
        description: 'Métadonnées de pagination associées à la liste'
    }),
    __metadata("design:type", PaginationMetaDto)
], PaginatedLogsDto.prototype, "meta", void 0);
//# sourceMappingURL=user-paginated-logs.dto.js.map