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
exports.HistoriquePaiementsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class HistoriquePaiementsDto {
    page = 1;
    limit = 20;
    annee;
    mois;
    montantMinimum;
    montantMaximum;
    avecEcart;
    avecFiche;
    ficheSigne;
    dateClotureDebut;
    dateClotureFin;
}
exports.HistoriquePaiementsDto = HistoriquePaiementsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: 'Numéro de la page demandée pour l\'historique',
        minimum: 1,
        default: 1,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], HistoriquePaiementsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 20,
        description: 'Nombre de lignes renvoyées par page (maximum : 100)',
        minimum: 1,
        maximum: 100,
        default: 20,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], HistoriquePaiementsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 2026,
        description: 'Filtrer l\'historique sur une année spécifique',
        minimum: 2020,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    __metadata("design:type", Number)
], HistoriquePaiementsDto.prototype, "annee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 7,
        description: 'Filtrer l\'historique sur un mois spécifique (1 à 12)',
        minimum: 1,
        maximum: 12,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], HistoriquePaiementsDto.prototype, "mois", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 50000,
        description: 'Montant net minimum versé (borne inférieure)',
        minimum: 0,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], HistoriquePaiementsDto.prototype, "montantMinimum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 500000,
        description: 'Montant net maximum versé (borne supérieure)',
        minimum: 0,
        type: Number
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], HistoriquePaiementsDto.prototype, "montantMaximum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: false,
        description: 'Si positionné à true, affiche uniquement les fiches de paie présentant un écart de versement (ex: Net à payer de 100 FCFA mais seulement 70 FCFA effectivement versés)',
        type: Boolean
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HistoriquePaiementsDto.prototype, "avecEcart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: true,
        description: 'Si positionné à true, filtre uniquement les lignes de paie dont le bulletin PDF a déjà été généré',
        type: Boolean
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HistoriquePaiementsDto.prototype, "avecFiche", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: false,
        description: 'Si positionné à true, filtre les fiches signées électroniquement par l\'employé. Si false, filtre les fiches en attente de signature',
        type: Boolean
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HistoriquePaiementsDto.prototype, "ficheSigne", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-01-01',
        description: 'Borne de début pour filtrer par date de clôture comptable effective (Format ISO: YYYY-MM-DD)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HistoriquePaiementsDto.prototype, "dateClotureDebut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-12-31',
        description: 'Borne de fin pour filtrer par date de clôture comptable effective (Format ISO: YYYY-MM-DD)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HistoriquePaiementsDto.prototype, "dateClotureFin", void 0);
//# sourceMappingURL=historique-paiements.dto.js.map