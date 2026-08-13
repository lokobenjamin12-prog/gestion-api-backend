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
exports.CloseSessionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class DepenseItemDto {
    montant;
    motif;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Montant de la dépense effectuée en FCFA',
        example: 2500,
        minimum: 0,
        type: Number
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DepenseItemDto.prototype, "montant", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Motif ou justification de la dépense (ex: carburant, ration, imprévu)',
        example: 'Achat de carburant pour livraison brousse',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DepenseItemDto.prototype, "motif", void 0);
class CloseSessionDto {
    quantiteRetour;
    depenses = [];
    heureRetour;
}
exports.CloseSessionDto = CloseSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantité totale d\'articles ou produits retournés invendus en fin de session',
        example: 5,
        minimum: 0,
        type: Number
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CloseSessionDto.prototype, "quantiteRetour", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [DepenseItemDto],
        description: 'Liste optionnelle des petites dépenses déclarées par le commercial durant sa session de vente',
        default: [],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DepenseItemDto),
    __metadata("design:type", Array)
], CloseSessionDto.prototype, "depenses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '17:30',
        description: 'Heure de retour ou de fin de course effective (Format HH:mm) — prend l\'heure actuelle par défaut si non fournie',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'heureRetour must be in HH:mm format (e.g. 08:30)',
    }),
    __metadata("design:type", String)
], CloseSessionDto.prototype, "heureRetour", void 0);
//# sourceMappingURL=close-session.dto.js.map