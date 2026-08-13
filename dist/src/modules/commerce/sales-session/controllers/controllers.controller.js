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
exports.ControllersController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../../auth/authentification/guards/auth.guard");
const dto_1 = require("../dto");
const services_service_1 = require("../services/services.service");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const get_sessions_filter_dto_1 = require("../dto/request/get-sessions-filter.dto");
const paginated_sessions_response_dto_1 = require("../dto/response/paginated-sessions-response-dto");
const get_commercial_sessions_dto_1 = require("../dto/request/get-commercial-sessions.dto");
const permissions_guard_1 = require("../../../auth/authentification/guards/permissions.guard");
const permissions_decorator_1 = require("../../../auth/authentification/decorators/permissions.decorator");
const require_contrat_decorator_1 = require("../../../../common/decorators/require-contrat.decorator");
const swagger_1 = require("@nestjs/swagger");
let ControllersController = class ControllersController {
    salesSessionService;
    constructor(salesSessionService) {
        this.salesSessionService = salesSessionService;
    }
    async openSession(dto, userId) {
        return await this.salesSessionService.openSession(dto, userId);
    }
    async closeSession(sessionId, dto, userId) {
        return this.salesSessionService.closeSession(sessionId, dto, userId);
    }
    async cancelSession(sessionId, managerId) {
        return await this.salesSessionService.cancelSession(sessionId, managerId);
    }
    async findAll(filter) {
        return this.salesSessionService.findAll(filter);
    }
    async findOne(id) {
        return this.salesSessionService.findOne(id);
    }
    async findByCommercial(commercialId, query) {
        return this.salesSessionService.findByCommercial(commercialId, query);
    }
};
exports.ControllersController = ControllersController;
__decorate([
    (0, common_1.Post)('open-session'),
    (0, permissions_decorator_1.RequirePermissions)('salessession:create'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Ouvrir une nouvelle session de vente',
        description: 'Permet à un administrateur ou un manager d\'ouvrir une caisse/session pour un commercial. Nécessite une validation de contrat actif.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, type: dto_1.SessionSummaryDto, description: 'Session ouverte avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données d\'ouverture de session invalides.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'salessession:create\' requis).' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Le commercial possède déjà une session ouverte.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.OpenSessionDto, String]),
    __metadata("design:returntype", Promise)
], ControllersController.prototype, "openSession", null);
__decorate([
    (0, common_1.Patch)(':id/close-session'),
    (0, permissions_decorator_1.RequirePermissions)('salessession:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Clôturer une session de vente active',
        description: 'Arrête la session de vente, fige les calculs, enregistre le montant final théorique et calcule les écarts de caisse éventuels.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique (UUID/CUID) de la session de vente à fermer.', example: 'sess_abc123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: dto_1.SessionSummaryDto, description: 'Session clôturée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session de vente introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CloseSessionDto, String]),
    __metadata("design:returntype", Promise)
], ControllersController.prototype, "closeSession", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, permissions_decorator_1.RequirePermissions)('salessession:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Annuler une session de vente ouverte',
        description: 'Permet d\'annuler une session ouverte par erreur. Cette action invalide la session sans générer de flux financiers régularisés.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de la session à annuler.', example: 'sess_abc123xyz' }),
    (0, swagger_1.ApiQuery)({ name: 'managerId', description: 'Identifiant du manager validant l\'annulation.', example: 'usr_mgr789' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: dto_1.SessionSummaryDto, description: 'Session annulée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('managerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ControllersController.prototype, "cancelSession", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('salessession:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister et filtrer l\'ensemble des sessions de vente',
        description: 'Retourne une liste paginée de toutes les sessions. Permet de filtrer par statut (ex: OPEN, CLOSED, CANCELLED).',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, type: paginated_sessions_response_dto_1.PaginatedSessionsResponseDto, description: 'Liste des sessions récupérée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_sessions_filter_dto_1.GetSessionsFilterDto]),
    __metadata("design:returntype", Promise)
], ControllersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('salessession:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter le détail complet d\'une session spécifique',
        description: 'Retourne toutes les informations calculées dynamiquement d\'une session de vente via son identifiant.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de la session.', example: 'sess_abc123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: dto_1.SessionSummaryDto, description: 'Données de la session trouvées.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ControllersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('commercial/:commercialId'),
    (0, permissions_decorator_1.RequirePermissions)('salessession:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir l\'historique des sessions d\'un commercial',
        description: 'Permet de récupérer toutes les sessions ouvertes ou fermées associées à un commercial spécifique avec support de pagination.',
    }),
    (0, swagger_1.ApiParam)({ name: 'commercialId', description: 'Identifiant unique du commercial.', example: 'usr_comm456' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: paginated_sessions_response_dto_1.PaginatedSessionsResponseDto, description: 'Historique du commercial récupéré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Param)('commercialId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_commercial_sessions_dto_1.GetCommercialSessionsDto]),
    __metadata("design:returntype", Promise)
], ControllersController.prototype, "findByCommercial", null);
exports.ControllersController = ControllersController = __decorate([
    (0, swagger_1.ApiTags)('Audit & Logs Commerciaux'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('sales-sessions'),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ControllersController);
//# sourceMappingURL=controllers.controller.js.map