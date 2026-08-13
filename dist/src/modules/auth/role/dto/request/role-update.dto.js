"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoleDto = void 0;
const role_create_dto_1 = require("./role-create.dto");
const swagger_1 = require("@nestjs/swagger");
class UpdateRoleDto extends (0, swagger_1.PartialType)(role_create_dto_1.CreateRoleDto) {
}
exports.UpdateRoleDto = UpdateRoleDto;
//# sourceMappingURL=role-update.dto.js.map