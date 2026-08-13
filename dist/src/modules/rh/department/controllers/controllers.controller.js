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
exports.DepartmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../../auth/authentification/guards/auth.guard");
const permissions_guard_1 = require("../../../auth/authentification/guards/permissions.guard");
const permissions_decorator_1 = require("../../../auth/authentification/decorators/permissions.decorator");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const services_service_1 = require("../services/services.service");
const create_department_dto_1 = require("../dto/create-department.dto");
const department_filters_dto_1 = require("../dto/department-filters.dto");
const update_department_dto_1 = require("../dto/update-department.dto");
let DepartmentController = class DepartmentController {
    departmentService;
    constructor(departmentService) {
        this.departmentService = departmentService;
    }
    async create(dto, actorId) {
        return await this.departmentService.create(dto, actorId);
    }
    async findAll(query) {
        return await this.departmentService.findAll(query);
    }
    async findOne(id) {
        return await this.departmentService.findOne(id);
    }
    async update(id, dto, actorId) {
        return await this.departmentService.update(id, dto, actorId);
    }
    async remove(id, actorId) {
        return await this.departmentService.remove(id, actorId);
    }
};
exports.DepartmentController = DepartmentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_decorator_1.RequirePermissions)('department:create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un nouveau département',
        description: 'Initialise un département. Le nom fourni sera automatiquement nettoyé (trim) et passé en majuscules sur le serveur.'
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Département créé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflit : Un département avec ce nom existe déjà.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_department_dto_1.CreateDepartmentDto, String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('department:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer la liste des départements',
        description: 'Supporte la pagination, le tri et la recherche textuelle filtrée par nom.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste paginée récupérée avec succès.',
        schema: {
            example: {
                data: [{ id: 1, name: 'FINANCE', roles: [] }],
                meta: { total: 1, page: 1, lastPage: 1, limit: 20 }
            }
        }
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [department_filters_dto_1.DepartmentFiltersDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('department:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir les détails d’un département',
        description: 'Récupère la fiche d\'un département spécifique incluant ses rôles, ses permissions associées et le volume d\'utilisateurs actifs.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'Identifiant numérique unique du département' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Département trouvé et retourné.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Département introuvable.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('department:update'),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier un département',
        description: 'Permet de modifier le libellé. Si le nom envoyé est identique à l\'ancien ou vide, la transaction est ignorée.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'Identifiant numérique du département à modifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Département mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Département introuvable.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflit : Le nouveau nom choisi est déjà attribué.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_department_dto_1.UpdateDepartmentDto, String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('department:delete'),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer définitivement un département',
        description: 'Supprime l\'enregistrement. La contrainte d\'intégrité échouera (409) si le département possède encore des rôles ou des employés rattachés.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'Identifiant numérique du département à supprimer' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Département supprimé avec succès de l\'organigramme.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Département introuvable.' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflit : Impossible de supprimer, le département est lié à des entités dépendantes.'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "remove", null);
exports.DepartmentController = DepartmentController = __decorate([
    (0, swagger_1.ApiTags)('Départements & Structure RH'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise : Token JWT manquant ou expiré.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit : Permissions de département insuffisantes.' }),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('departments'),
    __metadata("design:paramtypes", [services_service_1.DepartmentService])
], DepartmentController);
//# sourceMappingURL=controllers.controller.js.map