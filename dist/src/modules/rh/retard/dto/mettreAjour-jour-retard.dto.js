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
exports.MettreAJourJourRetardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class MettreAJourJourRetardDto {
    userId;
    date;
    estJustifie;
    heureArrivee;
}
exports.MettreAJourJourRetardDto = MettreAJourJourRetardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur concerné'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MettreAJourJourRetardDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-07',
        description: 'La date précise de la journée de retard à modifier au format ISO (YYYY-MM-DD)'
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'date doit être au format ISO : YYYY-MM-DD' }),
    __metadata("design:type", String)
], MettreAJourJourRetardDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Met à jour le statut du retard (vrai si un justificatif a été fourni et validé, faux sinon)'
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MettreAJourJourRetardDto.prototype, "estJustifie", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '08:45',
        description: 'Nouvelle heure effective d\'arrivée au bureau au format 24h (HH:MM). Optionnelle si le retard devient justifié.',
        pattern: '^\\d{2}:\\d{2}$'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, {
        message: "heureArrivee doit être au format HH:MM — ex: '08:45'",
    }),
    __metadata("design:type", String)
], MettreAJourJourRetardDto.prototype, "heureArrivee", void 0);
//# sourceMappingURL=mettreAjour-jour-retard.dto.js.map