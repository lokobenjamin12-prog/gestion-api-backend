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
exports.JourRetardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class JourRetardDto {
    date;
    estJustifie;
    heureArrivee;
}
exports.JourRetardDto = JourRetardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-07',
        description: 'La date du retard au format normalisé ISO (YYYY-MM-DD)'
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'date doit être au format ISO : YYYY-MM-DD' }),
    __metadata("design:type", String)
], JourRetardDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Indique si l\'employé a fourni un justificatif valable (certificat médical, panne, etc.) pour ce retard.'
    }),
    (0, class_validator_1.IsBoolean)({ message: 'estJustifie doit être un booléen' }),
    __metadata("design:type", Boolean)
], JourRetardDto.prototype, "estJustifie", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '08:45',
        description: 'Heure effective d\'arrivée au bureau au format 24h (HH:MM). Obligatoire si le retard est injustifié.',
        pattern: '^\\d{2}:\\d{2}$'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, {
        message: "heureArrivee doit être au format HH:MM — ex: '08:45'",
    }),
    __metadata("design:type", String)
], JourRetardDto.prototype, "heureArrivee", void 0);
//# sourceMappingURL=jour-retard.dto.js.map