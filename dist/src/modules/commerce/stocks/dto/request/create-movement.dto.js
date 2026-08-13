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
exports.CreateMovementDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateMovementDto {
    articleStockId;
    type;
    quantite;
    motif;
    movementDate;
}
exports.CreateMovementDto = CreateMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'stk_art789',
        description: 'Identifiant unique (UUID/CUID) de la ligne de stock liée à l\'article et son format',
        required: true
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "articleStockId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.TypeMouvement,
        example: client_1.TypeMouvement.ENTREE,
        description: 'Nature ou type du flux de stock à appliquer',
        required: true
    }),
    (0, class_validator_1.IsEnum)(client_1.TypeMouvement),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: 'Quantité d\'unités impliquées dans le mouvement (doit être strictement supérieure à 0)',
        minimum: 1,
        type: Number,
        required: true
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateMovementDto.prototype, "quantite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Réapprovisionnement fournisseur mensuel',
        description: 'Justification ou contexte de la modification du stock (obligatoire pour les ajustements)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "motif", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-06T18:00:00.000Z',
        description: 'Date et heure d\'exécution ou de prise en compte effective du mouvement',
        required: true,
        type: String,
        format: 'date-time'
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "La date du mouvement est obligatoire" }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: "Le format de date est invalide" }),
    __metadata("design:type", Date)
], CreateMovementDto.prototype, "movementDate", void 0);
//# sourceMappingURL=create-movement.dto.js.map