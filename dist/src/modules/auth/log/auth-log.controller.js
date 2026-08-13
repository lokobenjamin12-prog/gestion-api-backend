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
exports.AuthLogController = void 0;
const common_1 = require("@nestjs/common");
const auth_log_service_1 = require("./auth-log.service");
const auth_log_filters_dto_1 = require("./dto/auth-log-filters.dto");
const client_1 = require("@prisma/client");
const permissions_decorator_1 = require("../authentification/decorators/permissions.decorator");
const swagger_1 = require("@nestjs/swagger");
let AuthLogController = class AuthLogController {
    authLog;
    constructor(authLog) {
        this.authLog = authLog;
    }
    findAll(filters) {
        return this.authLog.findAll(filters);
    }
    getStats() {
        return this.authLog.getStats();
    }
    findByActor(actorId, filters) {
        return this.authLog.findByActor(actorId, filters);
    }
    findByModule(module, filters) {
        return this.authLog.findByModule(module, filters);
    }
    findOne(id) {
        return this.authLog.findOne(id);
    }
};
exports.AuthLogController = AuthLogController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister et filtrer les journaux d\'authentification (Paginé)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des journaux d\'audit récupérée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié. Cookie de session manquant ou expiré.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'auth-log:read\' requis).' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_log_filters_dto_1.AuthLogFiltersDto]),
    __metadata("design:returntype", void 0)
], AuthLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les statistiques globales des logs (Répartition par niveau, module, état)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques calculées et retournées avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthLogController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('actor/:actorId'),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer tous les journaux d\'audit générés par un acteur spécifique' }),
    (0, swagger_1.ApiParam)({ name: 'actorId', description: 'L\'identifiant unique de l\'utilisateur/acteur en base', example: 'usr_lmlk89210' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historique de l\'acteur extrait avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Param)('actorId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_log_filters_dto_1.AuthLogFiltersDto]),
    __metadata("design:returntype", void 0)
], AuthLogController.prototype, "findByActor", null);
__decorate([
    (0, common_1.Get)('module/:module'),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Filtrer les journaux d\'audit par sous-module ciblé' }),
    (0, swagger_1.ApiParam)({ name: 'module', description: 'Nom du module applicatif', enum: client_1.AuthModule }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logs du module récupérés avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Param)('module')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_log_filters_dto_1.AuthLogFiltersDto]),
    __metadata("design:returntype", void 0)
], AuthLogController.prototype, "findByModule", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Consulter le détail complet d\'une entrée de log (inclut l\'état avant/après modification)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de la ligne de log (ID UUID ou auto-incrémenté)', example: 'log_90a18f23' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détail du log trouvé et retourné.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ligne de log introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthLogController.prototype, "findOne", null);
exports.AuthLogController = AuthLogController = __decorate([
    (0, common_1.Controller)('auth-logs'),
    __metadata("design:paramtypes", [auth_log_service_1.AuthLogService])
], AuthLogController);
//# sourceMappingURL=auth-log.controller.js.map