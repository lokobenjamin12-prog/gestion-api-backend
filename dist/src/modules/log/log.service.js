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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const auth_log_service_1 = require("../auth/log/auth-log.service");
const commerce_log_service_1 = require("../commerce/log/commerce-log.service");
const rh_log_service_1 = require("../rh/log/rh-log.service");
const STOCK_ACTION_KEYWORDS = {
    ARTICLE: 'ARTICLE',
    CATEGORY: 'CATEGOR',
    MOUVEMENT: 'MOUVEMENT',
};
let LogService = class LogService {
    authLog;
    commerceLog;
    rhLog;
    constructor(authLog, commerceLog, rhLog) {
        this.authLog = authLog;
        this.commerceLog = commerceLog;
        this.rhLog = rhLog;
    }
    articles(filters) {
        return this.commerceLog.findAll(this.stockFilters(filters, STOCK_ACTION_KEYWORDS.ARTICLE));
    }
    categories(filters) {
        return this.commerceLog.findAll(this.stockFilters(filters, STOCK_ACTION_KEYWORDS.CATEGORY));
    }
    mouvementsStock(filters) {
        return this.commerceLog.findAll(this.stockFilters(filters, STOCK_ACTION_KEYWORDS.MOUVEMENT));
    }
    salesSession(filters) {
        return this.commerceLog.findAll({ ...filters, module: client_1.CommerceModule.SALES_SESSION });
    }
    stockFilters(filters, actionKeyword) {
        return { ...filters, module: client_1.CommerceModule.STOCK, action: actionKeyword };
    }
    authentification(filters) {
        return this.authLog.findByModule(client_1.AuthModule.AUTH, filters);
    }
    permissions(filters) {
        return this.authLog.findByModule(client_1.AuthModule.PERMISSION, filters);
    }
    roles(filters) {
        return this.authLog.findByModule(client_1.AuthModule.ROLE, filters);
    }
    users(filters) {
        return this.authLog.findByModule(client_1.AuthModule.USER, filters);
    }
    absences(filters) {
        return this.rhLog.findAll({ ...filters, module: client_1.RhModule.ABSENCE });
    }
    contrats(filters) {
        return this.rhLog.findAll({ ...filters, module: client_1.RhModule.CONTRAT });
    }
    departements(filters) {
        return this.rhLog.findAll({ ...filters, module: client_1.RhModule.DEPARTMENT });
    }
    rapports(filters) {
        return this.rhLog.findAll({ ...filters, module: client_1.RhModule.RAPPORT });
    }
    retards(filters) {
        return this.rhLog.findAll({ ...filters, module: client_1.RhModule.RETARD });
    }
    salaires(filters) {
        return this.rhLog.findAll({ ...filters, module: client_1.RhModule.SALAIRE });
    }
    get subModuleDefinitions() {
        return [
            { key: 'articles', label: 'Articles', path: '/logs/articles', fetch: (f) => this.articles(f) },
            { key: 'categories', label: 'Catégories', path: '/logs/categories', fetch: (f) => this.categories(f) },
            { key: 'mouvements-stock', label: 'Mouvements de stock', path: '/logs/mouvements-stock', fetch: (f) => this.mouvementsStock(f) },
            { key: 'authentification', label: 'Authentification', path: '/logs/authentification', fetch: (f) => this.authentification(f) },
            { key: 'permissions', label: 'Permissions', path: '/logs/permissions', fetch: (f) => this.permissions(f) },
            { key: 'roles', label: 'Rôles', path: '/logs/roles', fetch: (f) => this.roles(f) },
            { key: 'users', label: 'Utilisateurs', path: '/logs/users', fetch: (f) => this.users(f) },
            { key: 'sales-session', label: 'Sessions de vente', path: '/logs/sales-session', fetch: (f) => this.salesSession(f) },
            { key: 'absences', label: 'Absences', path: '/logs/absences', fetch: (f) => this.absences(f) },
            { key: 'contrats', label: 'Contrats', path: '/logs/contrats', fetch: (f) => this.contrats(f) },
            { key: 'departements', label: 'Départements', path: '/logs/departements', fetch: (f) => this.departements(f) },
            { key: 'rapports', label: 'Rapports', path: '/logs/rapports', fetch: (f) => this.rapports(f) },
            { key: 'retards', label: 'Retards', path: '/logs/retards', fetch: (f) => this.retards(f) },
            { key: 'salaires', label: 'Salaires', path: '/logs/salaires', fetch: (f) => this.salaires(f) },
        ];
    }
    async getOverview() {
        const probe = { page: 1, limit: 1 };
        return Promise.all(this.subModuleDefinitions.map(async (def) => {
            const result = await def.fetch(probe);
            return { key: def.key, label: def.label, path: def.path, total: result.meta.total };
        }));
    }
    async getGlobalStats() {
        const [authentification, commerce, rh] = await Promise.all([
            this.authLog.getStats(),
            this.commerceLog.getStats(),
            this.rhLog.getStats(),
        ]);
        return {
            total: authentification.total + commerce.total + rh.total,
            authentification,
            commerce,
            rh,
        };
    }
};
exports.LogService = LogService;
exports.LogService = LogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_log_service_1.AuthLogService,
        commerce_log_service_1.CommerceLogService,
        rh_log_service_1.RhLogService])
], LogService);
//# sourceMappingURL=log.service.js.map