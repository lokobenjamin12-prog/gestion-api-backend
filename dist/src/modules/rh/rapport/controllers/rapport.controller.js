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
exports.RapportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const permissions_decorator_1 = require("../../../auth/authentification/decorators/permissions.decorator");
const auth_guard_1 = require("../../../auth/authentification/guards/auth.guard");
const permissions_guard_1 = require("../../../auth/authentification/guards/permissions.guard");
const rapport_service_1 = require("../services/rapport.service");
const create_rapport_dto_1 = require("../dto/create-rapport.dto");
const filter_rapport_dto_1 = require("../dto/filter-rapport.dto");
const require_contrat_decorator_1 = require("../../../../common/decorators/require-contrat.decorator");
let RapportController = class RapportController {
    rapportService;
    constructor(rapportService) {
        this.rapportService = rapportService;
    }
    async generer(dto, actorId) {
        return this.rapportService.generer(dto, actorId);
    }
    async telechargerRapport(id, res) {
        const { stream, filename, mimeType } = await this.rapportService.getStream(id);
        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${filename}"`,
        });
        stream.pipe(res);
    }
    async findAll(filters) {
        return this.rapportService.findAll(filters);
    }
    async findOne(id) {
        return this.rapportService.findOne(id);
    }
    async softDelete(id, actorId) {
        return this.rapportService.softDelete(id, actorId);
    }
    async restore(id, actorId) {
        return this.rapportService.restore(id, actorId);
    }
};
exports.RapportController = RapportController;
__decorate([
    (0, common_1.Post)('generer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_decorator_1.RequirePermissions)('rapport:create'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Générer un nouveau rapport RH',
        description: 'Déclenche la compilation de données et génère un fichier (PDF ou Excel) basé sur les filtres fournis.'
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Le rapport a été initialisé et son fichier est prêt.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rapport_dto_1.CreateRapportDto, String]),
    __metadata("design:returntype", Promise)
], RapportController.prototype, "generer", null);
__decorate([
    (0, common_1.Get)(':id/telecharger'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('rapport:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Télécharger le document d\'un rapport',
        description: 'Récupère le fichier physique sous forme de flux binaire (Stream) et force le téléchargement côté client.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique du rapport (UUID/CUID)' }),
    (0, swagger_1.ApiProduces)('application/octet-stream', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fichier récupéré avec succès. Le flux binaire commence.',
        schema: {
            type: 'string',
            format: 'binary',
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rapport ou fichier physique introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RapportController.prototype, "telechargerRapport", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('rapport:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister et filtrer les rapports',
        description: 'Récupère l\'historique des rapports générés avec support de filtres (type, date, statut).'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Liste des rapports récupérée avec succès.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_rapport_dto_1.FilterRapportDto]),
    __metadata("design:returntype", Promise)
], RapportController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('rapport:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter les métadonnées d\'un rapport',
        description: 'Récupère les informations structurelles d\'un rapport (statut de génération, filtres appliqués, auteur) sans télécharger le fichier.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique du rapport' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Rapport trouvé et retourné avec succès.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rapport introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RapportController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id/supprimer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('rapport:delete'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Archiver un rapport (Suppression logique)',
        description: 'Place le rapport dans la corbeille. Le fichier reste disponible pour restauration.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique du rapport à archiver' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Rapport envoyé dans la corbeille avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rapport introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RapportController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('rapport:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Restaurer un rapport archivé',
        description: 'Sort le rapport ciblé de la corbeille pour le rendre à nouveau visible dans l\'historique actif.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique du rapport à restaurer' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Rapport restauré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rapport introuvable dans la corbeille.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RapportController.prototype, "restore", null);
exports.RapportController = RapportController = __decorate([
    (0, swagger_1.ApiTags)('Rapports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('rapports'),
    __metadata("design:paramtypes", [rapport_service_1.RapportService])
], RapportController);
//# sourceMappingURL=rapport.controller.js.map