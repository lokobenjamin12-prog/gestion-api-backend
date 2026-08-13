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
exports.SupprimerJourRetardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SupprimerJourRetardDto {
    userId;
    date;
}
exports.SupprimerJourRetardDto = SupprimerJourRetardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur concerné'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SupprimerJourRetardDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-07-07',
        description: 'La date précise de la journée de retard à supprimer au format ISO (YYYY-MM-DD)'
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'date doit être au format ISO : YYYY-MM-DD' }),
    __metadata("design:type", String)
], SupprimerJourRetardDto.prototype, "date", void 0);
//# sourceMappingURL=supprimer-jour-retard.dto.js.map