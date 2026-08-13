"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePermissionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const permission_create_dto_1 = require("./permission-create.dto");
class UpdatePermissionDto extends (0, swagger_1.PartialType)(permission_create_dto_1.CreatePermissionDto) {
}
exports.UpdatePermissionDto = UpdatePermissionDto;
//# sourceMappingURL=permission-update.dto.js.map