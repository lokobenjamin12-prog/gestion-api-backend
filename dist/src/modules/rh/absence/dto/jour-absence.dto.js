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
exports.JourAbsenceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class JourAbsenceDto {
    date;
    estJustifie;
}
exports.JourAbsenceDto = JourAbsenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-15',
        description: 'La date précise de l\'absence au format standardisé ISO (YYYY-MM-DD)'
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'date doit être au format ISO : YYYY-MM-DD' }),
    __metadata("design:type", String)
], JourAbsenceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Indique si l\'employé a fourni un justificatif officiel (arrêt maladie, attestation, etc.)'
    }),
    (0, class_validator_1.IsBoolean)({ message: 'estJustifie doit être un booléen' }),
    __metadata("design:type", Boolean)
], JourAbsenceDto.prototype, "estJustifie", void 0);
//# sourceMappingURL=jour-absence.dto.js.map