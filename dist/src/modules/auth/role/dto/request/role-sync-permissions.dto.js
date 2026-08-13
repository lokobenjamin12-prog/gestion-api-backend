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
exports.SyncPermissionsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SyncPermissionsDto {
    permissionIds;
}
exports.SyncPermissionsDto = SyncPermissionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Liste complète et exclusive des identifiants (IDs) de permissions à associer au rôle. Attention, toutes les permissions actuelles non présentes dans ce tableau seront définitivement révoquées pour ce rôle.',
        example: [1, 2, 3],
        type: [Number],
        required: true,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], SyncPermissionsDto.prototype, "permissionIds", void 0);
//# sourceMappingURL=role-sync-permissions.dto.js.map