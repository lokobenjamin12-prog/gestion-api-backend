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
exports.AjouterPrimeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AjouterPrimeDto {
    somme;
    raison;
}
exports.AjouterPrimeDto = AjouterPrimeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50000,
        description: 'Le montant financier de la prime (en FCFA ou devise locale). Doit être un nombre strictement positif.'
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'somme doit être un nombre' }),
    (0, class_validator_1.IsPositive)({ message: 'somme doit être positive' }),
    __metadata("design:type", Number)
], AjouterPrimeDto.prototype, "somme", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Prime de performance - Clôture projet Ndolecam',
        description: 'Le motif ou la justification de l\'attribution de cette prime (minimum 3 caractères).'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'raison doit contenir au moins 3 caractères' }),
    __metadata("design:type", String)
], AjouterPrimeDto.prototype, "raison", void 0);
//# sourceMappingURL=ajouter.prime.dto.js.map