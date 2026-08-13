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
exports.AbsenceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_decorator_1 = require("../../../auth/authentification/decorators/permissions.decorator");
const absence_service_1 = require("../services/absence.service");
const auth_guard_1 = require("../../../auth/authentification/guards/auth.guard");
const permissions_guard_1 = require("../../../auth/authentification/guards/permissions.guard");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const ajouter_absence_dto_1 = require("../dto/ajouter-absence.dto");
const mettre_a_jour_jour_absence_dto_1 = require("../dto/mettre-a-jour-jour-absence.dto");
const supprimer_jour_absencedto_1 = require("../dto/supprimer-jour-absencedto");
const find_all_absences_dto_1 = require("../dto/find-all-absences.dto");
const find_one_absence_dto_1 = require("../dto/find-one-absence.dto");
const require_contrat_decorator_1 = require("../../../../common/decorators/require-contrat.decorator");
let AbsenceController = class AbsenceController {
    absenceService;
    constructor(absenceService) {
        this.absenceService = absenceService;
    }
    async ajouterJours(dto, actorId) {
        return this.absenceService.ajouterJours(dto, actorId);
    }
    async mettreAJourJour(dto, actorId) {
        return this.absenceService.mettreAJourJour(dto, actorId);
    }
    async supprimerJour(dto, actorId) {
        return this.absenceService.supprimerJour(dto, actorId);
    }
    async findAll(dto) {
        return this.absenceService.findAll(dto);
    }
    async findOne(dto) {
        return this.absenceService.findOne(dto);
    }
};
exports.AbsenceController = AbsenceController;
__decorate([
    (0, common_1.Post)('jours'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('absence:create'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Allouer des jours d\'absence',
        description: 'Permet à un administrateur ou RH d\'enregistrer une période d\'absence pour un collaborateur.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Jours d\'absence alloués et enregistrés avec succès.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ajouter_absence_dto_1.AjouterAbsenceDto, String]),
    __metadata("design:returntype", Promise)
], AbsenceController.prototype, "ajouterJours", null);
__decorate([
    (0, common_1.Patch)('jour'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('absence:update'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier un jour d\'absence',
        description: 'Met à jour les détails ou le motif d\'un jour d\'absence spécifique.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Jour d\'absence mis à jour avec succès.'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mettre_a_jour_jour_absence_dto_1.MettreAJourJourAbsenceDto, String]),
    __metadata("design:returntype", Promise)
], AbsenceController.prototype, "mettreAJourJour", null);
__decorate([
    (0, common_1.Delete)('jour'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('absence:delete'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer un jour d\'absence',
        description: 'Retire définitivement un jour d\'absence du planning d\'un collaborateur.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Jour d\'absence supprimé avec succès de la base PostgreSQL.'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supprimer_jour_absencedto_1.SupprimerJourAbsenceDto, String]),
    __metadata("design:returntype", Promise)
], AbsenceController.prototype, "supprimerJour", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('absence:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister et filtrer toutes les absences',
        description: 'Récupère la liste paginée des absences avec filtres optionnels par utilisateur ou statut.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Liste des absences récupérée avec succès.'
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_absences_dto_1.FindAllAbsencesDto]),
    __metadata("design:returntype", Promise)
], AbsenceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':userId/:mois/:annee'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('absence:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter le bilan d\'un utilisateur pour un mois donné',
        description: 'Extrait le relevé complet des absences d\'un agent pour un mois et une année spécifiques.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Fiche d\'absence mensuelle trouvée et retournée.'
    }),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_one_absence_dto_1.FindOneAbsenceDto]),
    __metadata("design:returntype", Promise)
], AbsenceController.prototype, "findOne", null);
exports.AbsenceController = AbsenceController = __decorate([
    (0, swagger_1.ApiTags)('Absences & Congés'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise : Token JWT manquant ou expiré.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé : Permissions insuffisantes ou anomalie de contrat.' }),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('absences'),
    __metadata("design:paramtypes", [absence_service_1.AbsenceService])
], AbsenceController);
//# sourceMappingURL=absence.controller.js.map