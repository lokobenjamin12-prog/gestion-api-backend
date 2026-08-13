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
exports.CreateSimpleArticleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSimpleArticleDto {
    nomArticle;
}
exports.CreateSimpleArticleDto = CreateSimpleArticleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ndolé Premium Brut',
        description: 'Le nom de la référence brute de l\'article (sans catégorie ni stock associé)',
        maxLength: 100,
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom de l'article est obligatoire." }),
    (0, class_validator_1.MaxLength)(100, { message: "Le nom de l'article est trop long (max 100 caractères)." }),
    __metadata("design:type", String)
], CreateSimpleArticleDto.prototype, "nomArticle", void 0);
//# sourceMappingURL=create-simple-article.dto.js.map