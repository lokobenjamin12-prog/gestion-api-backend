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
exports.ContratController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contrat_service_1 = require("../services/contrat.service");
const client_1 = require("@prisma/client");
const create_contrat_dto_1 = require("../dto/create-contrat.dto");
const update_contrat_dto_1 = require("../dto/update-contrat.dto");
const permissions_guard_1 = require("../../../auth/authentification/guards/permissions.guard");
const auth_guard_1 = require("../../../auth/authentification/guards/auth.guard");
const permissions_decorator_1 = require("../../../auth/authentification/decorators/permissions.decorator");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const require_contrat_decorator_1 = require("../../../../common/decorators/require-contrat.decorator");
let ContratController = class ContratController {
    contratService;
    constructor(contratService) {
        this.contratService = contratService;
    }
    async create(dto, actorId) {
        if (!actorId) {
            throw new common_1.BadRequestException("Impossible d'identifier l'auteur de l'action, car requête non authentifiée (actorId vide)");
        }
        return await this.contratService.create(dto, actorId);
    }
    async findAll(userId, type, dateDebutFrom, dateDebutTo, includeArchived) {
        return await this.contratService.findAll({
            userId,
            type,
            dateDebutFrom,
            dateDebutTo,
            includeArchived: includeArchived === 'true',
        });
    }
    async getExpirationsProches(delai) {
        return await this.contratService.getExpirationsProches(delai ? parseInt(delai, 10) : 30);
    }
    async findOne(id) {
        return await this.contratService.findOne(id);
    }
    async update(id, dto, actorId) {
        return await this.contratService.update(id, dto, actorId);
    }
    async softDelete(id, actorId) {
        return await this.contratService.softDelete(id, actorId);
    }
    restore(id, actorId) {
        if (!actorId) {
            throw new common_1.BadRequestException("Impossible d'identifier l'auteur de l'action, car requête non authentifiée (actorId vide)");
        }
        return this.contratService.restore(id, actorId);
    }
};
exports.ContratController = ContratController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_decorator_1.RequirePermissions)('contrat:create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un contrat (CDD ou CDI)',
        description: 'Initialise un nouveau contrat de travail en base de données pour un employé.'
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Le contrat a été créé et enregistré avec succès.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contrat_dto_1.CreateContratDto, String]),
    __metadata("design:returntype", Promise)
], ContratController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('contrat:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister et filtrer les contrats',
        description: 'Récupère tous les contrats avec la possibilité de filtrer par collaborateur, type ou plage de date de début.'
    }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, description: 'Filtrer par l\'identifiant unique de l\'employé' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: ['CDD', 'CDI'], required: false, description: 'Filtrer par nature du contrat' }),
    (0, swagger_1.ApiQuery)({ name: 'dateDebutFrom', required: false, description: 'Date de début minimale (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'dateDebutTo', required: false, description: 'Date de début maximale (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'includeArchived', required: false, type: Boolean, description: 'Inclure les contrats archivés' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Liste des contrats récupérée avec succès.',
    }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('dateDebutFrom')),
    __param(3, (0, common_1.Query)('dateDebutTo')),
    __param(4, (0, common_1.Query)('includeArchived')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ContratController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('expirations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('contrat:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Détecter les CDD expirant prochainement',
        description: 'Analyse les contrats à durée déterminée et remonte ceux dont la date de fin approche du seuil d\'alerte.'
    }),
    (0, swagger_1.ApiQuery)({ name: 'delai', required: false, description: 'Nombre de jours restants avant l\'expiration (Valeur par défaut : 30)' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Liste des contrats arrivant à échéance calculée avec succès.',
    }),
    __param(0, (0, common_1.Query)('delai')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContratController.prototype, "getExpirationsProches", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('contrat:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir les détails d\'un contrat',
        description: 'Récupère la fiche complète d\'un contrat de travail à partir de son identifiant unique.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique du contrat (UUID/CUID)' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Contrat trouvé et retourné avec succès.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContratController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('contrat:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier un contrat existant',
        description: 'Met à jour les clauses, le salaire ou les dates d\'un contrat actif.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique du contrat à modifier' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Le contrat a été mis à jour avec succès.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_contrat_dto_1.UpdateContratDto, String]),
    __metadata("design:returntype", Promise)
], ContratController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('contrat:delete'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Suppression logique d\'un contrat',
        description: 'Archive logiquement le contrat (soft delete) pour préserver l\'historique des alertes logistiques et RH.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique du contrat à archiver' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Contrat archivé logiquement avec succès.'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContratController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('contrat:restore'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Restaurer un contrat archivé',
        description: 'Réactive un contrat précédemment supprimé logiquement pour le rendre à nouveau opérationnel.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique du contrat à restaurer' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Contrat restauré avec succès dans le catalogue actif.'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContratController.prototype, "restore", null);
exports.ContratController = ContratController = __decorate([
    (0, swagger_1.ApiTags)('Contrats & Alertes RH'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise : Token JWT manquant, invalide ou expiré.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit : Permissions insuffisantes pour manipuler les contrats.' }),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('contrats'),
    __metadata("design:paramtypes", [contrat_service_1.ContratService])
], ContratController);
//# sourceMappingURL=contrat.controller.js.map