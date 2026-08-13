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
exports.RetardController = void 0;
const common_1 = require("@nestjs/common");
const ajouter_retard_dto_1 = require("../dto/ajouter-retard-dto");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const retard_service_1 = require("../services/retard.service");
const swagger_1 = require("@nestjs/swagger");
const permissions_decorator_1 = require("../../../auth/authentification/decorators/permissions.decorator");
const permissions_guard_1 = require("../../../auth/authentification/guards/permissions.guard");
const auth_guard_1 = require("../../../auth/authentification/guards/auth.guard");
const common_2 = require("@nestjs/common");
const mettreAjour_jour_retard_dto_1 = require("../dto/mettreAjour-jour-retard.dto");
const supprimer_jour_retard_dto_1 = require("../dto/supprimer-jour-retard.dto");
const find_all_retards_dto_1 = require("../dto/find-all-retards.dto");
const find_one_retard_dto_1 = require("../dto/find-one-retard-dto");
const require_contrat_decorator_1 = require("../../../../common/decorators/require-contrat.decorator");
let RetardController = class RetardController {
    retardService;
    constructor(retardService) {
        this.retardService = retardService;
    }
    async ajouterJours(dto, actorId) {
        return this.retardService.ajouterJours(dto, actorId);
    }
    async mettreAJourJour(dto, actorId) {
        return this.retardService.mettreAJourJour(dto, actorId);
    }
    async supprimerJour(dto, actorId) {
        return this.retardService.supprimerJour(dto, actorId);
    }
    async findAll(dto) {
        return this.retardService.findAll(dto);
    }
    async findOne(dto) {
        return this.retardService.findOne(dto);
    }
};
exports.RetardController = RetardController;
__decorate([
    (0, common_1.Post)('jours'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('retard:create'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Ajouter ou fusionner des jours de retard',
        description: 'Enregistre un ou plusieurs retards pour un collaborateur. Si un retard existe déjà à cette date, les minutes peuvent être cumulées ou mises à jour.'
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Jours de retard ajoutés ou mis à jour avec succès.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ajouter_retard_dto_1.AjouterRetardDto, String]),
    __metadata("design:returntype", Promise)
], RetardController.prototype, "ajouterJours", null);
__decorate([
    (0, common_1.Patch)('jour'),
    (0, permissions_decorator_1.RequirePermissions)('retard:update'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier la durée d\'un jour de retard précis',
        description: 'Permet de corriger le volume de minutes de retard ou de modifier son statut pour une journée spécifique.'
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Le jour de retard a été modifié avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Aucun enregistrement de retard trouvé pour cette date.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mettreAjour_jour_retard_dto_1.MettreAJourJourRetardDto, String]),
    __metadata("design:returntype", Promise)
], RetardController.prototype, "mettreAJourJour", null);
__decorate([
    (0, common_1.Delete)('jour'),
    (0, permissions_decorator_1.RequirePermissions)('retard:delete'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer un enregistrement de retard',
        description: 'Retire définitivement la pénalité ou la ligne de retard associée à un collaborateur pour un jour donné.'
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Enregistrement de retard supprimé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Retard introuvable.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supprimer_jour_retard_dto_1.SupprimerJourRetardDto, String]),
    __metadata("design:returntype", Promise)
], RetardController.prototype, "supprimerJour", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('retard:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister et filtrer tous les retards',
        description: 'Récupère l\'historique global des retards de l\'ensemble des utilisateurs avec pagination et filtres (mois, année, userId).'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Liste des retards récupérée avec succès.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_retards_dto_1.FindAllRetardsDto]),
    __metadata("design:returntype", Promise)
], RetardController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':userId/:mois/:annee'),
    (0, permissions_decorator_1.RequirePermissions)('retard:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter les retards d\'un employé pour un mois ciblé',
        description: 'Extrait le planning et le cumul des minutes de retard d\'un collaborateur précis pour un mois et une année donnés.'
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'Identifiant unique (UUID/CUID) du collaborateur', type: String }),
    (0, swagger_1.ApiParam)({ name: 'mois', description: 'Numéro du mois (1 à 12)', type: Number, example: 7 }),
    (0, swagger_1.ApiParam)({ name: 'annee', description: 'Année concernée (ex: 2026)', type: Number, example: 2026 }),
    (0, swagger_1.ApiOkResponse)({ description: 'Fiche mensuelle des retards de l\'utilisateur récupérée.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Collaborateur ou période introuvable.' }),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_one_retard_dto_1.FindOneRetardDto]),
    __metadata("design:returntype", Promise)
], RetardController.prototype, "findOne", null);
exports.RetardController = RetardController = __decorate([
    (0, swagger_1.ApiTags)('Gestion des Retards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise : Token JWT manquant ou expiré.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit : Permissions insuffisantes ("retard:*" manquante).' }),
    (0, common_2.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('retards'),
    __metadata("design:paramtypes", [retard_service_1.RetardService])
], RetardController);
//# sourceMappingURL=retard.controller.js.map