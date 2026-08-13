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
exports.CommerceLogController = void 0;
const common_1 = require("@nestjs/common");
const commerce_log_service_1 = require("./commerce-log.service");
const commerce_log_filters_dto_1 = require("./dto/commerce-log-filters.dto");
const permissions_decorator_1 = require("../../auth/authentification/decorators/permissions.decorator");
const swagger_1 = require("@nestjs/swagger");
let CommerceLogController = class CommerceLogController {
    commerceLog;
    constructor(commerceLog) {
        this.commerceLog = commerceLog;
    }
    findAll(filters) {
        return this.commerceLog.findAll(filters);
    }
    getStats() {
        return this.commerceLog.getStats();
    }
    findByActor(actorId, filters) {
        return this.commerceLog.findByActor(actorId, filters);
    }
    findOne(id) {
        return this.commerceLog.findOne(id);
    }
};
exports.CommerceLogController = CommerceLogController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('commerce-log:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer la liste paginée et filtrée des logs d\'audit commerciaux',
        description: 'Permet de suivre toutes les activités critiques (ventes, stocks, facturation). Supporte le filtrage multicritères et la pagination.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des logs récupérée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'commerce-log:read\' requis).' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commerce_log_filters_dto_1.CommerceLogFiltersDto]),
    __metadata("design:returntype", void 0)
], CommerceLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_decorator_1.RequirePermissions)('commerce-log:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir les statistiques globales d\'activité d\'audit',
        description: 'Retourne la répartition agrégée des logs par niveau de sévérité (INFO, WARN, ERROR), par module et par état (SUCCESS, FAILED). Idéal pour alimenter les graphiques de votre tableau de bord HR/Admin.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques calculées et retournées avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommerceLogController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('actor/:actorId'),
    (0, permissions_decorator_1.RequirePermissions)('commerce-log:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Historique d\'audit complet pour un acteur/utilisateur spécifique',
        description: 'Extrait toutes les actions enregistrées en base associées à un UUID utilisateur, tout en appliquant les filtres additionnels de pagination ou de dates.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'actorId',
        description: 'Identifiant unique (UUID) de l\'employé ou de l\'acteur technique.',
        example: 'usr_abc123xyz',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logs de l\'acteur récupérés avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Acteur introuvable.' }),
    __param(0, (0, common_1.Param)('actorId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, commerce_log_filters_dto_1.CommerceLogFiltersDto]),
    __metadata("design:returntype", void 0)
], CommerceLogController.prototype, "findByActor", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('commerce-log:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter le détail complet d\'un log d\'audit',
        description: 'Retourne une ligne d\'audit détaillée. Inclut les métadonnées techniques ainsi que les états d\'historisation des données (`valeurAvant` et `valeurApres`) au format JSON.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Identifiant unique de la ligne de log d\'audit.',
        example: 'log_999888xyz',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détail du log trouvé et retourné.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Enregistrement de log introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommerceLogController.prototype, "findOne", null);
exports.CommerceLogController = CommerceLogController = __decorate([
    (0, swagger_1.ApiTags)('Audit & Logs Commerciaux'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.Controller)('commerce-logs'),
    __metadata("design:paramtypes", [commerce_log_service_1.CommerceLogService])
], CommerceLogController);
//# sourceMappingURL=commerce-log.controller.js.map