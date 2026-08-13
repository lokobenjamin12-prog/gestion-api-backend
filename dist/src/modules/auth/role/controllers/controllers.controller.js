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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const services_service_1 = require("../services/services.service");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const role_create_dto_1 = require("../dto/request/role-create.dto");
const role_filters_dto_1 = require("../dto/request/role-filters.dto");
const role_update_dto_1 = require("../dto/request/role-update.dto");
const role_sync_permissions_dto_1 = require("../dto/request/role-sync-permissions.dto");
const role_addRemovePermissions_dto_1 = require("../dto/request/role-addRemovePermissions.dto");
const permissions_guard_1 = require("../../authentification/guards/permissions.guard");
const permissions_decorator_1 = require("../../authentification/decorators/permissions.decorator");
const auth_guard_1 = require("../../authentification/guards/auth.guard");
const swagger_1 = require("@nestjs/swagger");
let RoleController = class RoleController {
    roleService;
    constructor(roleService) {
        this.roleService = roleService;
    }
    async create(createRoleDto, actorId) {
        return await this.roleService.create(createRoleDto, actorId);
    }
    async findAll(query) {
        return await this.roleService.findAll(query);
    }
    async findOne(id) {
        return await this.roleService.findOne(id);
    }
    async update(id, updateRoleDto, actorId) {
        return await this.roleService.update(id, updateRoleDto, actorId);
    }
    async syncPermissions(id, syncPermissionsDto, actorId) {
        return await this.roleService.syncPermissions(id, syncPermissionsDto, actorId);
    }
    async addPermissions(id, addPermissionsDto, actorId) {
        return await this.roleService.addPermissions(id, addPermissionsDto, actorId);
    }
    async removePermissions(id, removePermissionsDto, actorId) {
        return await this.roleService.removePermissions(id, removePermissionsDto, actorId);
    }
    async remove(id, actorId) {
        return await this.roleService.remove(id, actorId);
    }
};
exports.RoleController = RoleController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('role:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau rôle avec permissions' }),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau rôle avec permissions' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Le rôle a été créé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides ou permissions inexistantes.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'role:create\' requis).' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflit : ce rôle existe déjà.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_create_dto_1.CreateRoleDto, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('role:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer la liste des rôles avec pagination et filtres' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste des rôles récupérée avec succès.',
        schema: {
            example: {
                data: [
                    { id: 1, nom: 'Ressources Humaines', description: 'Gestion globale des employés', code: 'RH', _count: { users: 5 } }
                ],
                meta: { total: 1, page: 1, lastPage: 1, limit: 20, hasNextPage: false, hasPreviousPage: false }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_filters_dto_1.RoleFiltersDto]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('role:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer un rôle spécifique par son ID',
        description: 'Retourne les détails du rôle incluant le département et les permissions associées.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant numérique unique du rôle', example: 1, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails du rôle récupérés avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'L’identifiant fourni est invalide (doit être un nombre).' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Le rôle demandé n’existe pas.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('role:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un rôle existant' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant numérique du rôle à modifier', example: 3, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Le rôle a été mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données fournies incorrectes.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rôle ou Département introuvable.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflit : le nouveau nom de rôle généré existe déjà.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, role_update_dto_1.UpdateRoleDto, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/permissions/sync'),
    (0, permissions_decorator_1.RequirePermissions)('role:update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Synchroniser (remplacer) les permissions d’un rôle',
        description: 'Supprime toutes les permissions actuelles et les remplace par la liste fournie.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant numérique du rôle concerné', example: 1, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permissions synchronisées avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'ID invalide ou liste de permissions corrompue.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Le rôle spécifié n’existe pas.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, role_sync_permissions_dto_1.SyncPermissionsDto, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "syncPermissions", null);
__decorate([
    (0, common_1.Post)(':id/permissions/add'),
    (0, permissions_decorator_1.RequirePermissions)('role:update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Ajouter des permissions à un rôle',
        description: 'Ajoute une liste de permissions au rôle spécifié sans supprimer les permissions existantes.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant numérique du rôle ciblé', example: 2, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permissions ajoutées avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'ID invalide ou certaines permissions n’existent pas.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Le rôle spécifié n’existe pas.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, role_addRemovePermissions_dto_1.AddRemovePermissionsDto, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "addPermissions", null);
__decorate([
    (0, common_1.Post)(':id/permissions/remove'),
    (0, permissions_decorator_1.RequirePermissions)('role:update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Retirer des permissions spécifiques d’un rôle',
        description: 'Supprime uniquement les relations entre le rôle et les permissions fournies dans le tableau.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant numérique du rôle à modifier', example: 1, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permissions retirées avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'ID invalide ou requête mal formée.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rôle introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, role_addRemovePermissions_dto_1.AddRemovePermissionsDto, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "removePermissions", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('role:delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer définitivement un rôle',
        description: 'La suppression échouera si le rôle est encore assigné à des utilisateurs (contrainte d’intégrité métier).'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du rôle à détruire', example: 4, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Le rôle a été supprimé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Le rôle demandé n’existe pas.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflit : suppression impossible car des utilisateurs possèdent ce rôle.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "remove", null);
exports.RoleController = RoleController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('roles'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [services_service_1.RoleService])
], RoleController);
//# sourceMappingURL=controllers.controller.js.map