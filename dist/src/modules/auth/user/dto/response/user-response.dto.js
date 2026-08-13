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
exports.PaginatedUserResponseDto = exports.UserMetaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserMetaDto {
    total;
    page;
    limit;
    lastPage;
    hasNextPage;
    hasPrevPage;
}
exports.UserMetaDto = UserMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'Nombre total de lignes correspondant aux filtres' }),
    __metadata("design:type", Number)
], UserMetaDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Index de la page courante' }),
    __metadata("design:type", Number)
], UserMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Nombre d\'éléments maximum retournés par page' }),
    __metadata("design:type", Number)
], UserMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Numéro de la dernière page disponible' }),
    __metadata("design:type", Number)
], UserMetaDto.prototype, "lastPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Indique s\'il existe une page suivante' }),
    __metadata("design:type", Boolean)
], UserMetaDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Indique s\'il existe une page précédente' }),
    __metadata("design:type", Boolean)
], UserMetaDto.prototype, "hasPrevPage", void 0);
class PaginatedUserResponseDto {
    data;
    meta;
}
exports.PaginatedUserResponseDto = PaginatedUserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [Object],
        description: 'Liste des utilisateurs filtrés et nettoyés'
    }),
    __metadata("design:type", Array)
], PaginatedUserResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: UserMetaDto,
        description: 'Informations et indicateurs de navigation de la pagination'
    }),
    __metadata("design:type", UserMetaDto)
], PaginatedUserResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=user-response.dto.js.map