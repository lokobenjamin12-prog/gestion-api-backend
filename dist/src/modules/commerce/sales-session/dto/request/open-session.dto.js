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
exports.OpenSessionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class OpenSessionDto {
    commercialId;
    articleStockId;
    quantiteDepart;
    jourOuverture;
    heureDepart;
}
exports.OpenSessionDto = OpenSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'usr_comm456',
        description: 'Identifiant unique (UUID/CUID) du commercial associé à cette session de vente',
        required: true
    }),
    (0, swagger_1.ApiProperty)({ example: 'cldxyz123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OpenSessionDto.prototype, "commercialId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'stk_art789',
        description: 'Identifiant unique du lot d\'articles ou du stock attribué pour la course/session',
        required: true
    }),
    (0, swagger_1.ApiProperty)({ example: 'cldabc456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OpenSessionDto.prototype, "articleStockId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50,
        description: 'Quantité initiale de produits/marchandises emportée par le commercial au départ',
        minimum: 1,
        type: Number,
        required: true
    }),
    (0, swagger_1.ApiProperty)({ example: 10 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], OpenSessionDto.prototype, "quantiteDepart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-07-06',
        description: 'Date d\'ouverture de la session (Format: YYYY-MM-DD) — prend la date du jour par défaut si non fournie',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], OpenSessionDto.prototype, "jourOuverture", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '08:30',
        description: 'Heure de départ ou de début de session (Format HH:mm) — prend l\'heure actuelle de l\'instance par défaut si non fournie',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'heureDepart must be in HH:mm format (e.g. 08:30)',
    }),
    __metadata("design:type", String)
], OpenSessionDto.prototype, "heureDepart", void 0);
//# sourceMappingURL=open-session.dto.js.map