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
exports.LogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_decorator_1 = require("../auth/authentification/decorators/permissions.decorator");
const log_service_1 = require("./log.service");
const log_query_filters_dto_1 = require("./dto/log-query-filters.dto");
let LogController = class LogController {
    logService;
    constructor(logService) {
        this.logService = logService;
    }
    getOverview() {
        return this.logService.getOverview();
    }
    getStats() {
        return this.logService.getGlobalStats();
    }
    getArticles(filters) {
        return this.logService.articles(filters);
    }
    getCategories(filters) {
        return this.logService.categories(filters);
    }
    getMouvementsStock(filters) {
        return this.logService.mouvementsStock(filters);
    }
    getSalesSession(filters) {
        return this.logService.salesSession(filters);
    }
    getAuthentification(filters) {
        return this.logService.authentification(filters);
    }
    getPermissions(filters) {
        return this.logService.permissions(filters);
    }
    getRoles(filters) {
        return this.logService.roles(filters);
    }
    getUsers(filters) {
        return this.logService.users(filters);
    }
    getAbsences(filters) {
        return this.logService.absences(filters);
    }
    getContrats(filters) {
        return this.logService.contrats(filters);
    }
    getDepartements(filters) {
        return this.logService.departements(filters);
    }
    getRapports(filters) {
        return this.logService.rapports(filters);
    }
    getRetards(filters) {
        return this.logService.retards(filters);
    }
    getSalaires(filters) {
        return this.logService.salaires(filters);
    }
};
exports.LogController = LogController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read', 'commerce-log:read', 'rh-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Vue d\'ensemble des sous-modules de logs disponibles (avec leur total)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read', 'commerce-log:read', 'rh-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques globales combinées (Authentification + Commerce + RH)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('articles'),
    (0, permissions_decorator_1.RequirePermissions)('commerce-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Article' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getArticles", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, permissions_decorator_1.RequirePermissions)('commerce-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Catégorie' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('mouvements-stock'),
    (0, permissions_decorator_1.RequirePermissions)('commerce-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Mouvement de stock' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getMouvementsStock", null);
__decorate([
    (0, common_1.Get)('sales-session'),
    (0, permissions_decorator_1.RequirePermissions)('commerce-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Session de vente' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getSalesSession", null);
__decorate([
    (0, common_1.Get)('authentification'),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Authentification' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getAuthentification", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Permission' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Rôle' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, permissions_decorator_1.RequirePermissions)('auth-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Utilisateur' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('absences'),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Absence' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getAbsences", null);
__decorate([
    (0, common_1.Get)('contrats'),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Contrat' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getContrats", null);
__decorate([
    (0, common_1.Get)('departements'),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Département' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getDepartements", null);
__decorate([
    (0, common_1.Get)('rapports'),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Rapport' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getRapports", null);
__decorate([
    (0, common_1.Get)('retards'),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Retard' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getRetards", null);
__decorate([
    (0, common_1.Get)('salaires'),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Logs du sous-module Salaire' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_query_filters_dto_1.LogQueryFiltersDto]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "getSalaires", null);
exports.LogController = LogController = __decorate([
    (0, swagger_1.ApiTags)('Logs (Vue centrale)'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, common_1.Controller)('logs'),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogController);
//# sourceMappingURL=log.controller.js.map