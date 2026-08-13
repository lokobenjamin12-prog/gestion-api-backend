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
exports.RhLogController = void 0;
const common_1 = require("@nestjs/common");
const rh_log_service_1 = require("./rh-log.service");
const rh_log_filters_dto_1 = require("./dto/rh-log-filters.dto");
const permissions_decorator_1 = require("../../auth/authentification/decorators/permissions.decorator");
const swagger_1 = require("@nestjs/swagger");
let RhLogController = class RhLogController {
    rhLog;
    constructor(rhLog) {
        this.rhLog = rhLog;
    }
    findAll(filters) {
        return this.rhLog.findAll(filters);
    }
    getStats() {
        return this.rhLog.getStats();
    }
    findByActor(actorId, filters) {
        return this.rhLog.findByActor(actorId, filters);
    }
    findOne(id) {
        return this.rhLog.findOne(id);
    }
};
exports.RhLogController = RhLogController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister et filtrer l\'historique des logs d\'audit',
        description: 'Récupère une liste paginée des actions exécutées sur le système (création de contrat, modification d\'absence, etc.) triées par pertinence chronologique.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Liste paginée des logs d\'audit retournée avec succès.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rh_log_filters_dto_1.RhLogFiltersDto]),
    __metadata("design:returntype", void 0)
], RhLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir les statistiques globales d\'audit',
        description: 'Renvoie une vue d\'ensemble agrégée de la répartition des logs par niveau de sévérité (INFO/WARN/ERROR), par module fonctionnel et par statut (SUCCESS/FAILED).'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Statistiques d\'audit générées avec succès.',
        schema: {
            example: {
                parNiveau: { INFO: 150, WARN: 12, ERROR: 2 },
                parModule: { CONTRAT: 80, ABSENCE: 64, DEPARTMENT: 20 },
                parEtat: { SUCCESS: 158, FAILED: 6 }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RhLogController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('actor/:actorId'),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les actions d\'un acteur spécifique',
        description: 'Extrait l\'historique d\'activité complet d\'un utilisateur donné (auteur des modifications) avec support des filtres additionnels et de la pagination.'
    }),
    (0, swagger_1.ApiParam)({ name: 'actorId', description: 'Identifiant unique (UUID ou CUID) de l\'utilisateur ciblé' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Logs de l\'acteur récupérés avec succès.' }),
    __param(0, (0, common_1.Param)('actorId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rh_log_filters_dto_1.RhLogFiltersDto]),
    __metadata("design:returntype", void 0)
], RhLogController.prototype, "findByActor", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('rh-log:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter le détail complet d\'un log d\'audit',
        description: 'Récupère la fiche unitaire d\'une entrée d\'audit. Utile pour inspecter les métadonnées techniques profonds comme les deltas de modifications (valeurAvant / valeurApres).'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique du log d\'audit (UUID/CUID)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Fiche de log d\'audit trouvée et retournée.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Log d\'audit introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhLogController.prototype, "findOne", null);
exports.RhLogController = RhLogController = __decorate([
    (0, swagger_1.ApiTags)('Audit & Logs RH'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise : Token JWT absent ou expiré.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit : Permission "rh-log:read" manquante.' }),
    (0, common_1.Controller)('rh-logs'),
    __metadata("design:paramtypes", [rh_log_service_1.RhLogService])
], RhLogController);
//# sourceMappingURL=rh-log.controller.js.map