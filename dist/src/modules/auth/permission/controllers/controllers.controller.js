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
exports.PermissionController = void 0;
const services_service_1 = require("../services/services.service");
const common_1 = require("@nestjs/common");
const permission_create_dto_1 = require("../dto/request/permission-create.dto");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const permission_filters_dto_1 = require("../dto/request/permission-filters.dto");
const permission_update_dto_1 = require("../dto/request/permission-update.dto");
const auth_guard_1 = require("../../authentification/guards/auth.guard");
const permissions_guard_1 = require("../../authentification/guards/permissions.guard");
const permissions_decorator_1 = require("../../authentification/decorators/permissions.decorator");
const swagger_1 = require("@nestjs/swagger");
let PermissionController = class PermissionController {
    permissionService;
    constructor(permissionService) {
        this.permissionService = permissionService;
    }
    async create(dto, actorId) {
        return await this.permissionService.create(dto, actorId);
    }
    async findAll(query) {
        return await this.permissionService.findAll(query);
    }
    async findOne(id) {
        return await this.permissionService.findOne(id);
    }
    async findBySlug(slug) {
        return await this.permissionService.findBySlug(slug);
    }
    async update(id, dto, actorId) {
        return await this.permissionService.update(id, dto, actorId);
    }
    async remove(id, actorId) {
        return await this.permissionService.remove(id, actorId);
    }
};
exports.PermissionController = PermissionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_decorator_1.RequirePermissions)('permission:create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer une nouvelle permission système',
        description: 'Le slug transmis dans le DTO sera nettoyé, débarrassé de ses espaces/tirets et forcé en MAJUSCULES (SNAKE_CASE).'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'La permission a été créée avec succès et enregistrée dans l’audit.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Le format des données envoyées est incorrect.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise (Token JWT manquant ou expiré).' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit : Droits insuffisants.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Un conflit est survenu : Cette permission technique existe déjà.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [permission_create_dto_1.CreatePermissionDto, String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('permission:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer la liste paginée des permissions système',
        description: 'Permet de filtrer par recherche textuelle (sur le slug) et de gérer la pagination (page, limit).'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste des permissions récupérée avec succès.',
        schema: {
            example: {
                data: [
                    { id: 1, slug: 'CREATE_USER', nom: 'Créer un utilisateur', _count: { roles: 2 } },
                    { id: 2, slug: 'UPDATE_STOCK', nom: 'Modifier le stock', _count: { roles: 1 } }
                ],
                meta: {
                    total: 2,
                    page: 1,
                    lastPage: 1,
                    limit: 50,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise (JWT invalide).' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Privilèges insuffisants.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [permission_filters_dto_1.PermissionFiltersDto]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('permission:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter les détails d’une permission spécifique via son ID',
        description: 'Renvoie les informations de la permission ainsi que le nombre de rôles associés.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permission trouvée et retournée.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'L’identifiant fourni est invalide (doit être un entier supérieur à 0).' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification JWT manquante ou expirée.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit pour ce rôle.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'La permission recherchée n’existe pas.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('permission:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Trouver une permission par son slug technique',
        description: 'Permet de récupérer les détails d’un droit via son identifiant textuel (ex: CREATE_USER).'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permission trouvée et retournée avec son décompte d’utilisation.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Le slug fourni est vide ou mal formaté.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Droits d’accès insuffisants.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Aucune permission ne correspond à ce slug dans le système.' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('permission:update'),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier une permission système via son ID',
        description: 'Permet de mettre à jour le slug (qui sera nettoyé et normalisé) ou la description. L’action est journalisée dans l’audit.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'La permission a été mise à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'L’ID ou les données fournies dans le DTO sont invalides.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit : Droits insuffisants.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'La permission avec cet ID n’existe pas.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflit : Le nouveau slug proposé est déjà utilisé par une autre permission.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, permission_update_dto_1.UpdatePermissionDto, String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('permission:delete'),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer définitivement une permission système via son ID',
        description: 'Détache automatiquement la permission de tous les rôles associés (table pivot) avant de l’effacer définitivement de la base de données. L’action est consignée dans l’audit.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'La permission a été déliée et supprimée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'L’identifiant fourni est invalide.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit : Privilèges insuffisants.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'La permission avec cet ID n’existe pas dans le système.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "remove", null);
exports.PermissionController = PermissionController = __decorate([
    (0, swagger_1.ApiTags)('Permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('permissions'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [services_service_1.PermissionService])
], PermissionController);
//# sourceMappingURL=controllers.controller.js.map