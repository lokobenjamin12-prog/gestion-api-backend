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
exports.ArticleController = void 0;
const common_1 = require("@nestjs/common");
const article_service_1 = require("../../services/article/article.service");
const create_article_dto_1 = require("../../dto/request/create-article.dto");
const update_article_dto_1 = require("../../dto/request/update-article.dto");
const auth_guard_1 = require("../../../../auth/authentification/guards/auth.guard");
const get_articles_query_dto_1 = require("../../dto/request/get-articles-query.dto");
const create_article_respons_dto_1 = require("../../dto/response/create-article-respons-dto");
const article_detail_response_dto_1 = require("../../dto/response/article-detail-response.dto");
const get_articles_response_dto_1 = require("../../dto/response/get-articles-response.dto");
const create_simple_article_dto_1 = require("../../dto/request/create-simple-article.dto");
const permissions_guard_1 = require("../../../../auth/authentification/guards/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/authentification/decorators/permissions.decorator");
const swagger_1 = require("@nestjs/swagger");
const get_categories_by_categoryId_query_dto_1 = require("../../dto/request/get-categories-by-categoryId-query.dto");
const require_contrat_decorator_1 = require("../../../../../common/decorators/require-contrat.decorator");
let ArticleController = class ArticleController {
    articleService;
    constructor(articleService) {
        this.articleService = articleService;
    }
    async createSimple(dto, req) {
        const currentUser = req.user;
        return await this.articleService.createSimpleArticle(dto, currentUser);
    }
    async create(dto, req) {
        return this.articleService.createArticleWithCategory(dto, req.user);
    }
    async findAll(query, req) {
        return await this.articleService.findAll(query, req.user);
    }
    getCategoriesByArticle(id, query, req) {
        return this.articleService.getCategoriesByArticle(id, query, req.user);
    }
    async findOne(id, req) {
        return await this.articleService.findOne(id, req.user);
    }
    async update(id, dto, req) {
        return await this.articleService.update(id, dto, req.user);
    }
    async softDeleteArticle(id, req) {
        return this.articleService.softDeleteArticle(id, req.user);
    }
    async restoreArticle(id, req) {
        return this.articleService.restoreArticle(id, req.user);
    }
    async remove(id, req) {
        return await this.articleService.hardDeleteArticle(id, req.user);
    }
};
exports.ArticleController = ArticleController;
__decorate([
    (0, common_1.Post)('simple-create-article'),
    (0, permissions_decorator_1.RequirePermissions)('article:create'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer une référence article de base',
        description: 'Crée l\'entité Article brute sans stock ni catégorie initiale.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Article de base créé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données fournies invalides.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'article:create\' requis).' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflit : Le nom de l\'article existe déjà en base.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_simple_article_dto_1.CreateSimpleArticleDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "createSimple", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, permissions_decorator_1.RequirePermissions)('article:create'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un article avec sa catégorie et son stock initial',
        description: 'Crée l\'article et initialise ses relations de stock et de catégorie au cours d\'une même transaction.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, type: create_article_respons_dto_1.CreateArticleResponseDto, description: 'Article complet initialisé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Le nom de l\'article ou les références sont en conflit.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_article_dto_1.CreateArticleDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('find-all'),
    (0, permissions_decorator_1.RequirePermissions)('article:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer la liste filtrée et paginée des articles',
        description: 'Retourne un catalogue d\'articles selon les filtres passés en query string.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, type: get_articles_response_dto_1.GetArticlesResponseDto, description: 'Catalogue d\'articles retourné avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_articles_query_dto_1.GetArticlesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/categories'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('article:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir les catégories paginées associées à un article',
        description: 'Retourne l\'ensemble des liaisons de catégories pour l\'article spécifié.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique (UUID/CUID) de l\'article ciblé.', example: 'art_123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des catégories de l\'article récupérée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_categories_by_categoryId_query_dto_1.GetCategoriesByArticleQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ArticleController.prototype, "getCategoriesByArticle", null);
__decorate([
    (0, common_1.Get)('find-one/:id'),
    (0, permissions_decorator_1.RequirePermissions)('article:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter la fiche détaillée d\'un article',
        description: 'Retourne l\'intégralité des métadonnées d\'un article via son identifiant unique.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de l\'article.', example: 'art_123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: article_detail_response_dto_1.ArticleDetailResponseDto, description: 'Détails de l\'article trouvés et retournés.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    (0, permissions_decorator_1.RequirePermissions)('article:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Mettre à jour les informations d\'un article',
        description: 'Permet de modifier les caractéristiques de base (nom, prix, etc.) d\'une référence.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de l\'article à modifier.', example: 'art_123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Payload de modification invalide.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_article_dto_1.UpdateArticleDto, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('soft-delete/:id'),
    (0, permissions_decorator_1.RequirePermissions)('article:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Désactiver un article (Archivage logique)',
        description: 'Bascule l\'état de l\'article pour le masquer de l\'application sans le supprimer définitivement de la base PostgreSQL.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de l\'article à archiver.', example: 'art_123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article archivé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "softDeleteArticle", null);
__decorate([
    (0, common_1.Patch)('restore/:id'),
    (0, permissions_decorator_1.RequirePermissions)('article:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Restaurer un article archivé',
        description: 'Réactive un article précédemment placé en soft-delete pour le rendre de nouveau visible dans le catalogue actif.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de l\'article à restaurer.', example: 'art_123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article restauré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article introuvable ou déjà actif.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "restoreArticle", null);
__decorate([
    (0, common_1.Delete)('physical-delete/:id'),
    (0, permissions_decorator_1.RequirePermissions)('article:delete'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Suppression physique définitive de l\'article',
        description: '⚠️ Action irréversible. Supprime définitivement la ligne d\'article de la base de données.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de l\'article à détruire.', example: 'art_123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article définitivement retiré de la base de données.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'article:delete\' requis).' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "remove", null);
exports.ArticleController = ArticleController = __decorate([
    (0, swagger_1.ApiTags)('Gestion des Articles'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('articles'),
    __metadata("design:paramtypes", [article_service_1.ArticleService])
], ArticleController);
//# sourceMappingURL=article.controller.js.map