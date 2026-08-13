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
var MovementStockController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementStockController = void 0;
const common_1 = require("@nestjs/common");
const stock_service_1 = require("../../services/stock/stock.service");
const create_movement_dto_1 = require("../../dto/request/create-movement.dto");
const auth_guard_1 = require("../../../../auth/authentification/guards/auth.guard");
const common_2 = require("@nestjs/common");
const get_historique_dto_1 = require("../../dto/request/get-historique.dto");
const permissions_guard_1 = require("../../../../auth/authentification/guards/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/authentification/decorators/permissions.decorator");
const require_contrat_decorator_1 = require("../../../../../common/decorators/require-contrat.decorator");
const swagger_1 = require("@nestjs/swagger");
let MovementStockController = MovementStockController_1 = class MovementStockController {
    stockService;
    constructor(stockService) {
        this.stockService = stockService;
    }
    logger = new common_2.Logger(MovementStockController_1.name);
    processMovement(dto, req) {
        return this.stockService.processMovement(dto, req.user);
    }
    async getStockOverview() {
        this.logger.log('📥 Requête reçue : Vue d’ensemble des stocks');
        return await this.stockService.getStockOverview();
    }
    async getAlerts() {
        this.logger.log('📥 Requête API : Récupération des alertes de stock');
        return await this.stockService.getArticlesEnAlerte();
    }
    async getMouvements(query) {
        this.logger.log(`📥 Requête : Historique (Page ${query.page}, Limite ${query.limit})`);
        return await this.stockService.getMouvementsStock(query);
    }
};
exports.MovementStockController = MovementStockController;
__decorate([
    (0, common_1.Post)('mouvements'),
    (0, permissions_decorator_1.RequirePermissions)('movement:create'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Enregistrer un nouveau mouvement de stock',
        description: 'Permet d\'effectuer une entrée, une sortie, un réajustement ou un transfert de stock. Met à jour l\'état des inventaires.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mouvement de stock traité et enregistré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données du mouvement invalides ou stock insuffisant.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'movement:create\' requis).' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_movement_dto_1.CreateMovementDto, Object]),
    __metadata("design:returntype", void 0)
], MovementStockController.prototype, "processMovement", null);
__decorate([
    (0, common_1.Get)('get-stocks'),
    (0, permissions_decorator_1.RequirePermissions)('movement:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir la vue d’ensemble des stocks de l\'entrepôt',
        description: 'Retourne l\'état des stocks actuels pour l\'ensemble des articles du catalogue.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vue d\'ensemble des stocks récupérée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MovementStockController.prototype, "getStockOverview", null);
__decorate([
    (0, common_1.Get)('Obtenir-Articles-En-Alerte'),
    (0, permissions_decorator_1.RequirePermissions)('movement:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les articles en alerte de stock (Seuil critique)',
        description: 'Extrait la liste des produits dont la quantité actuelle est inférieure ou égale au seuil de sécurité configuré (utile pour vos alertes automatiques).',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des articles en alerte générée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MovementStockController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('mouvements'),
    (0, permissions_decorator_1.RequirePermissions)('movement:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter l\'historique paginé des mouvements de stock',
        description: 'Permet de tracer l\'ensemble des flux logistiques (entrées/sorties) passés sur le système avec filtres et pagination.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historique des mouvements de stock retourné avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_historique_dto_1.GetHistoriqueDto]),
    __metadata("design:returntype", Promise)
], MovementStockController.prototype, "getMouvements", null);
exports.MovementStockController = MovementStockController = MovementStockController_1 = __decorate([
    (0, swagger_1.ApiTags)('Logistique & Mouvements de Stock'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('movement-stock'),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], MovementStockController);
//# sourceMappingURL=movement-stock.controller.js.map