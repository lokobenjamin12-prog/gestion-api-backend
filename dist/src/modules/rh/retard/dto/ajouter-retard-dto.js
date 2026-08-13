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
exports.AjouterRetardDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const jour_retard_dto_1 = require("./jour-retard.dto");
const swagger_1 = require("@nestjs/swagger");
class AjouterRetardDto {
    userId;
    mois;
    annee;
    jours;
}
exports.AjouterRetardDto = AjouterRetardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur concerné'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AjouterRetardDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 7,
        description: 'Le mois correspondant pour le traitement du compteur RH (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], AjouterRetardDto.prototype, "mois", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2026,
        description: 'L\'année correspondante pour le traitement du compteur RH',
        minimum: 2000,
        type: Number
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], AjouterRetardDto.prototype, "annee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [jour_retard_dto_1.JourRetardDto],
        description: 'Tableau contenant la liste des journées de retard à enregistrer ou fusionner en base de données.'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Au moins un jour est requis' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => jour_retard_dto_1.JourRetardDto),
    __metadata("design:type", Array)
], AjouterRetardDto.prototype, "jours", void 0);
//# sourceMappingURL=ajouter-retard-dto.js.map