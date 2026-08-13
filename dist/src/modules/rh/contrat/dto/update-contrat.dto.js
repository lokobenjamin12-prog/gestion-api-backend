"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContratDto = void 0;
const create_contrat_dto_1 = require("./create-contrat.dto");
const mapped_types_1 = require("@nestjs/mapped-types");
class UpdateContratDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(create_contrat_dto_1.CreateContratDto, ['userId', 'type', 'dateDebut'])) {
}
exports.UpdateContratDto = UpdateContratDto;
//# sourceMappingURL=update-contrat.dto.js.map