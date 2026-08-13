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
exports.MettreAJourJourAbsenceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class MettreAJourJourAbsenceDto {
    userId;
    date;
    estJustifie;
}
exports.MettreAJourJourAbsenceDto = MettreAJourJourAbsenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'usr_heidi123abc',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur dont on modifie l\'absence'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MettreAJourJourAbsenceDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-15',
        description: 'La date du jour à modifier au format ISO (YYYY-MM-DD). Le mois et l\'année sont automatiquement extraits de cette chaîne par le serveur.'
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'date doit être au format ISO : YYYY-MM-DD' }),
    __metadata("design:type", String)
], MettreAJourJourAbsenceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Le nouveau statut de justification pour cette journée (ex: passage de false à true suite au dépôt d\'un arrêt de travail)'
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MettreAJourJourAbsenceDto.prototype, "estJustifie", void 0);
//# sourceMappingURL=mettre-a-jour-jour-absence.dto.js.map