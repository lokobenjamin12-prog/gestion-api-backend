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
exports.CategoryController = void 0;
const common_1 = require("@nestjs/common");
const create_category_dto_1 = require("../../dto/request/create-category.dto");
const category_service_1 = require("../../services/category/category.service");
const auth_guard_1 = require("../../../../auth/authentification/guards/auth.guard");
const get_categories_query_dto_1 = require("../../dto/request/get-categories-query.dto");
const update_category_dto_1 = require("../../dto/request/update-category.dto");
const permissions_guard_1 = require("../../../../auth/authentification/guards/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/authentification/decorators/permissions.decorator");
const require_contrat_decorator_1 = require("../../../../../common/decorators/require-contrat.decorator");
const swagger_1 = require("@nestjs/swagger");
let CategoryController = class CategoryController {
    categoryService;
    constructor(categoryService) {
        this.categoryService = categoryService;
    }
    create(dto, req) {
        return this.categoryService.create(dto, req.user);
    }
    findAll(query, req) {
        return this.categoryService.findAll(query, req.user);
    }
    async findOne(id, req) {
        return this.categoryService.findOne(id, req.user);
    }
    update(id, updateCategoryDto, req) {
        return this.categoryService.update(id, updateCategoryDto, req.user);
    }
    softRemove(id, req) {
        return this.categoryService.softDelete(id, req.user);
    }
    async restore(id, req) {
        return this.categoryService.restore(id, req.user);
    }
    async remove(id, req) {
        return this.categoryService.remove(id, req.user);
    }
};
exports.CategoryController = CategoryController;
__decorate([
    (0, common_1.Post)('create'),
    (0, permissions_decorator_1.RequirePermissions)('category:create'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer une nouvelle catégorie d\'articles',
        description: 'Crée une catégorie unique (ex: Boissons, Plats, Épices) pour regrouper et filtrer vos produits.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Catégorie créée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Payload ou données fournies invalides.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'category:create\' requis).' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflit : Le nom de cette catégorie existe déjà.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto, Object]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('find-all'),
    (0, permissions_decorator_1.RequirePermissions)('category:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer la liste paginée et filtrée des catégories',
        description: 'Retourne l\'ensemble des catégories configurées selon les filtres de recherche fournis.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des catégories retournée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_categories_query_dto_1.GetCategoriesQueryDto, Object]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('find-one/:id'),
    (0, permissions_decorator_1.RequirePermissions)('category:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter une catégorie par son identifiant',
        description: 'Retourne les métadonnées d\'une catégorie spécifique.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique (UUID/CUID) de la catégorie.', example: 'cat_abc123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Catégorie trouvée et retournée.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Catégorie introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    (0, permissions_decorator_1.RequirePermissions)('category:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier les informations d\'une catégorie',
        description: 'Permet de mettre à jour les propriétés modifiables (comme le nom ou la description) d\'une catégorie existante.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la catégorie à mettre à jour.', example: 'cat_abc123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Catégorie mise à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données de mise à jour invalides.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Catégorie introuvable.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Le nouveau nom entré est déjà utilisé.' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateCategoryDto, Object]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('soft-delete/:id'),
    (0, permissions_decorator_1.RequirePermissions)('category:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Désactiver temporairement une catégorie (Archivage logique)',
        description: 'Masque la catégorie dans l\'application en changeant son état en base, sans altérer physiquement l\'historique des données.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la catégorie à archiver.', example: 'cat_abc123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Catégorie archivée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Catégorie introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "softRemove", null);
__decorate([
    (0, common_1.Patch)('restore-category/:id'),
    (0, permissions_decorator_1.RequirePermissions)('category:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Restaurer une catégorie archivée',
        description: 'Réactive une catégorie précédemment placée en soft-delete pour la réintégrer dans le catalogue actif.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la catégorie à restaurer.', example: 'cat_abc123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Catégorie restaurée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Catégorie introuvable ou déjà active.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    (0, permissions_decorator_1.RequirePermissions)('category:delete'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Suppression physique définitive d\'une catégorie',
        description: '⚠️ Action définitive et irréversible. Supprime la ligne de catégorie de la base PostgreSQL.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de la catégorie à éliminer définitivement.', example: 'cat_abc123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Catégorie définitivement purgée.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'category:delete\' requis).' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Catégorie introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "remove", null);
exports.CategoryController = CategoryController = __decorate([
    (0, swagger_1.ApiTags)('Gestion des Catégories'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [category_service_1.CategoryService])
], CategoryController);
//# sourceMappingURL=category.controller.js.map