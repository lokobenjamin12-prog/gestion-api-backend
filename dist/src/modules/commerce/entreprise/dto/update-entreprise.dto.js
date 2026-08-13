"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEntrepriseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_entreprise_dto_1 = require("./create-entreprise.dto");
class UpdateEntrepriseDto extends (0, swagger_1.PartialType)(create_entreprise_dto_1.CreateEntrepriseDto) {
}
exports.UpdateEntrepriseDto = UpdateEntrepriseDto;
//# sourceMappingURL=update-entreprise.dto.js.map