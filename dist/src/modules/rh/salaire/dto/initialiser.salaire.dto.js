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
exports.InitialiserSalaireDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InitialiserSalaireDto {
    userId;
    mois;
    annee;
}
exports.InitialiserSalaireDto = InitialiserSalaireDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur pour lequel initialiser l\'état de paie.'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitialiserSalaireDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 7,
        description: 'Le numéro du mois à initialiser (1 à 12).',
        minimum: 1,
        maximum: 12,
        type: Number
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], InitialiserSalaireDto.prototype, "mois", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2026,
        description: 'L\'année civile concernée par l\'état de salaire initial.',
        minimum: 2000,
        type: Number
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], InitialiserSalaireDto.prototype, "annee", void 0);
//# sourceMappingURL=initialiser.salaire.dto.js.map