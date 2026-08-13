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
exports.SalaireController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../../auth/authentification/guards/auth.guard");
const permissions_guard_1 = require("../../../auth/authentification/guards/permissions.guard");
const salaire_service_1 = require("../services/salaire.service");
const permissions_decorator_1 = require("../../../auth/authentification/decorators/permissions.decorator");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const initialiser_salaire_dto_1 = require("../dto/initialiser.salaire.dto");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const generer_fiche_dto_1 = require("../dto/generer-fiche.dto");
const ajouter_prime_dto_1 = require("../dto/ajouter.prime.dto");
const supprimer_prime_dto_1 = require("../dto/supprimer-prime.dto");
const versement_dto_1 = require("../dto/versement.dto");
const find_all_salaires_dto_1 = require("../dto/find-all-salaires.dto");
const get_masse_salariale_dto_1 = require("../dto/get-masse-salariale.dto");
const require_contrat_decorator_1 = require("../../../../common/decorators/require-contrat.decorator");
const historique_paiements_dto_1 = require("../dto/historique-paiements.dto");
let SalaireController = class SalaireController {
    prisma;
    salaireService;
    constructor(prisma, salaireService) {
        this.prisma = prisma;
        this.salaireService = salaireService;
    }
    async initialiser(dto, actorId) {
        return this.salaireService.initialiser(dto, actorId);
    }
    async getMasseSalariale(dto) {
        return this.salaireService.getMasseSalariale(dto);
    }
    async findAll(dto) {
        return this.salaireService.findAll(dto);
    }
    async ajouterPrime(salaireId, dto, actorId) {
        return this.salaireService.ajouterPrime(salaireId, dto, actorId);
    }
    async supprimerPrime(salaireId, dto, actorId) {
        return this.salaireService.supprimerPrime(salaireId, dto, actorId);
    }
    async cloturerMois(salaireId, actorId) {
        return this.salaireService.cloturerMois(salaireId, actorId);
    }
    async enregistrerVersement(salaireId, dto, actorId) {
        return this.salaireService.enregistrerVersement(salaireId, dto, actorId);
    }
    async genererFicheDePaie(salaireId, dto, actorId) {
        return this.salaireService.genererFicheDePaie(salaireId, dto, actorId);
    }
    async telechargerFiche(id, res) {
        const { stream, filename, mimeType } = await this.salaireService.getFicheStream(id);
        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${filename}"`,
        });
        stream.pipe(res);
    }
    async findOne(salaireId) {
        return this.salaireService.findOne(salaireId);
    }
    async getHistoriquePaiements(userId, dto) {
        return this.salaireService.getHistoriquePaiements(userId, dto);
    }
};
exports.SalaireController = SalaireController;
__decorate([
    (0, common_1.Post)('initialiser'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:create'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Initialiser la feuille de paie mensuelle',
        description: 'Génère les états de salaire initiaux pour un mois et une année donnés basés sur les contrats actifs.'
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'États de salaires mensuels initialisés avec succès.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initialiser_salaire_dto_1.InitialiserSalaireDto, String]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "initialiser", null);
__decorate([
    (0, common_1.Get)('masse-salariale'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Calculer la masse salariale globale',
        description: 'Récupère les statistiques financières cumulées (salaires bruts, nets, charges, primes cumulées) sur une période.'
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Statistiques de la masse salariale calculées.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_masse_salariale_dto_1.GetMasseSalarialeDto]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "getMasseSalariale", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister et filtrer les fiches de paie de l\'entreprise',
        description: 'Retourne une liste paginée de l\'ensemble des états de salaires avec filtres multicritères.'
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste des états de salaires récupérée avec succès.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_salaires_dto_1.FindAllSalairesDto]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/primes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Ajouter une prime ou une indemnité',
        description: 'Ajoute une ligne de prime au calcul de paie en cours d\'un employé avant clôture.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de l\'état de salaire' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Prime ajout de manière fructueuse.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'État de salaire introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ajouter_prime_dto_1.AjouterPrimeDto, String]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "ajouterPrime", null);
__decorate([
    (0, common_1.Delete)(':id/primes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer une prime spécifique',
        description: 'Retire une prime ajoutée par erreur d\'un état de paie non clôturé via son index ou son ID.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de l\'état de salaire' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Prime retirée avec succès et salaire recalculé.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, supprimer_prime_dto_1.SupprimerPrimeDto, String]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "supprimerPrime", null);
__decorate([
    (0, common_1.Post)(':id/cloturer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Clôturer le mois comptable de paie',
        description: 'Fige définitivement les calculs d\'un employé pour le mois. Bloque toute modification ultérieure des primes ou des absences.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de l\'état de salaire' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Mois comptable gelé et clôturé avec succès.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "cloturerMois", null);
__decorate([
    (0, common_1.Post)(':id/versements'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Enregistrer un ordre de versement',
        description: 'Associe un paiement ou une avance (numéraire, virement, chèque) à une feuille de paie et met à jour le solde restant dû.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de l\'état de salaire' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Versement pris en compte financièrement.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, versement_dto_1.VersementDto, String]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "enregistrerVersement", null);
__decorate([
    (0, common_1.Post)(':id/fiche-de-paie'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:update'),
    (0, require_contrat_decorator_1.RequireContratActor)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Générer le document PDF de la fiche de paie',
        description: 'Compile et fige la mise en page officielle de la fiche de paie avec sa date de paiement.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de l\'état de salaire' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Fiche de paie générée et stockée.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generer_fiche_dto_1.GenererFicheDto, String]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "genererFicheDePaie", null);
__decorate([
    (0, common_1.Get)(':id/telecharger-fiche'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:update'),
    (0, swagger_1.ApiOperation)({
        summary: 'Télécharger le bulletin de paie au format PDF',
        description: 'Récupère le fichier physique du bulletin de paie généré sous forme de flux binaire.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de l\'état de paie lié au document' }),
    (0, swagger_1.ApiProduces)('application/pdf'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Document PDF transmis avec succès.',
        schema: { type: 'string', format: 'binary' }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Fiche de paie physique absente ou non encore générée.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "telechargerFiche", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter un état de salaire unitaire',
        description: 'Renvoie le détail complet du calcul comptable d\'un employé (Heures, Primes, Retards, Avances).'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant technique de la ligne de paie' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Fiche de salaire unitaire trouvée et retournée.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ligne de salaire introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('user/:userId/historique-paiements'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('salaire:read'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter l\'historique des gains d\'un employé',
        description: 'Permet à un employé (ou aux RH) de lister chronologiquement l\'historique de toutes ses fiches de paie validées.'
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'Identifiant unique de l\'employé' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Historique d\'activité comptable extrait avec succès.' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, historique_paiements_dto_1.HistoriquePaiementsDto]),
    __metadata("design:returntype", Promise)
], SalaireController.prototype, "getHistoriquePaiements", null);
exports.SalaireController = SalaireController = __decorate([
    (0, swagger_1.ApiTags)('Gestion des Salaires & Paie'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentification requise : Token JWT absent ou expiré.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit : Permissions insuffisantes pour les opérations de paie.' }),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('salaires'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        salaire_service_1.SalaireService])
], SalaireController);
//# sourceMappingURL=salaire.controller.js.map