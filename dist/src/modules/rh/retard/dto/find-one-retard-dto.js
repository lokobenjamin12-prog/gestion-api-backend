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
exports.FindOneRetardDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class FindOneRetardDto {
    userId;
    mois;
    annee;
}
exports.FindOneRetardDto = FindOneRetardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur ciblé'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindOneRetardDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 7,
        description: 'Numéro du mois recherché (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], FindOneRetardDto.prototype, "mois", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2026,
        description: 'Année civile recherchée (ex: 2026)',
        minimum: 2000,
        type: Number
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], FindOneRetardDto.prototype, "annee", void 0);
//# sourceMappingURL=find-one-retard-dto.js.map