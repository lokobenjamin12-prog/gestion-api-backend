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
exports.PaginatedSessionsResponseDto = exports.PaginationMetaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const session_response_dto_1 = require("./session-response.dto");
class PaginationMetaDto {
    total;
    page;
    limit;
    lastPage;
    hasNextPage;
    hasPreviousPage;
}
exports.PaginationMetaDto = PaginationMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 150,
        description: 'Nombre total d\'enregistrements existants correspondant aux filtres appliqués'
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Index de la page courante renvoyée'
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 20,
        description: 'Nombre maximal d\'éléments demandés par page'
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 8,
        description: 'Numéro de la dernière page disponible calculée'
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "lastPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Indique s\'il existe une page suivante par rapport à la page courante'
    }),
    __metadata("design:type", Boolean)
], PaginationMetaDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Indique s\'il existe une page précédente par rapport à la page courante'
    }),
    __metadata("design:type", Boolean)
], PaginationMetaDto.prototype, "hasPreviousPage", void 0);
class PaginatedSessionsResponseDto {
    data;
    meta;
}
exports.PaginatedSessionsResponseDto = PaginatedSessionsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [session_response_dto_1.SessionSummaryDto],
        description: 'Liste des sessions de vente formatées, filtrées et nettoyées pour la page demandée',
    }),
    __metadata("design:type", Array)
], PaginatedSessionsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: PaginationMetaDto,
        description: 'Métadonnées et indicateurs de navigation associés à la pagination'
    }),
    __metadata("design:type", PaginationMetaDto)
], PaginatedSessionsResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=paginated-sessions-response-dto.js.map