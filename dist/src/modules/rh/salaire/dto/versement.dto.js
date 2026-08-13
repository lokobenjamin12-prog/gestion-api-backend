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
exports.VersementDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VersementDto {
    montantVerse;
}
exports.VersementDto = VersementDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 150000,
        description: 'Le montant financier effectivement versé à l\'employé (en FCFA ou devise locale). Doit être un nombre strictement positif.'
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'montantVerse doit être un nombre' }),
    (0, class_validator_1.IsPositive)({ message: 'montantVerse doit être positif' }),
    __metadata("design:type", Number)
], VersementDto.prototype, "montantVerse", void 0);
//# sourceMappingURL=versement.dto.js.map