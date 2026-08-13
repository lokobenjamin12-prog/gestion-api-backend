"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrepriseController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const auth_guard_1 = require("../../../auth/authentification/guards/auth.guard");
const permissions_guard_1 = require("../../../auth/authentification/guards/permissions.guard");
const entreprise_service_1 = require("../services/entreprise.service");
const permissions_decorator_1 = require("../../../auth/authentification/decorators/permissions.decorator");
const create_entreprise_dto_1 = require("../dto/create-entreprise.dto");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const update_entreprise_dto_1 = require("../dto/update-entreprise.dto");
const swagger_1 = require("@nestjs/swagger");
const LOGO_DIR = path.join(process.cwd(), 'storage', 'logos');
if (!fs.existsSync(LOGO_DIR)) {
    fs.mkdirSync(LOGO_DIR, { recursive: true });
}
let EntrepriseController = class EntrepriseController {
    entrepriseService;
    constructor(entrepriseService) {
        this.entrepriseService = entrepriseService;
    }
    create(dto, actorId) {
        return this.entrepriseService.create(dto, actorId);
    }
    get() {
        return this.entrepriseService.get();
    }
    update(dto, actorId) {
        return this.entrepriseService.update(dto, actorId);
    }
    async uploadLogo(file, actorId) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        console.log(file);
        return this.entrepriseService.updateLogo({ logo: file.path }, actorId);
    }
};
exports.EntrepriseController = EntrepriseController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_decorator_1.RequirePermissions)('entreprise:create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configurer les informations initiales de l\'entreprise',
        description: 'Cette opération doit être exécutée une seule fois au démarrage ou lors du setup initial. Le système lèvera une exception de conflit (409) si une configuration entreprise existe déjà.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Entreprise initialisée et configurée avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'entreprise:create\' requis).' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'L\'entreprise a déjà été configurée sur cette instance.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_entreprise_dto_1.CreateEntrepriseDto, String]),
    __metadata("design:returntype", void 0)
], EntrepriseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('entreprise:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir les informations de l\'entreprise',
        description: 'Retourne l\'ensemble de l\'identité de la structure (Nom, NUI/Régistre de commerce, contact, adresse, logo) pour affichage global ou sur les entêtes de documents.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Données de l\'entreprise récupérées avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EntrepriseController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('entreprise:update'),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier les informations de l\'entreprise',
        description: 'Permet une mise à jour partielle (PATCH). Seuls les champs envoyés dans le corps de la requête seront altérés.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Informations de l\'entreprise mises à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_entreprise_dto_1.UpdateEntrepriseDto, String]),
    __metadata("design:returntype", void 0)
], EntrepriseController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('logo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('enteprrise:update'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Fichier image du logo de l\'entreprise (Formats acceptés : JPG, JPEG, PNG. Poids max : 2 Mo)',
        schema: {
            type: 'object',
            properties: {
                logo: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Uploader et remplacer le logo de l\'entreprise',
        description: 'Prend en charge le téléversement de fichiers multimédias. Si un ancien logo existe sur le stockage, il sera automatiquement supprimé physiquement pour éviter l\'accumulation de fichiers orphelins.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logo téléversé et mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Fichier absent, format invalide ou taille supérieure à 2 Mo.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo', {
        storage: (0, multer_1.diskStorage)({
            destination: LOGO_DIR,
            filename: (_req, file, cb) => {
                const ext = path.extname(file.originalname).toLowerCase();
                const filename = `logo_entreprise_${Date.now()}${ext}`;
                cb(null, filename);
            },
        }),
        fileFilter: (_req, file, cb) => {
            const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowed.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Seuls les formats JPG et PNG sont acceptés'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntrepriseController.prototype, "uploadLogo", null);
exports.EntrepriseController = EntrepriseController = __decorate([
    (0, swagger_1.ApiTags)('Configuration Entreprise'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('entreprise'),
    __metadata("design:paramtypes", [entreprise_service_1.EntrepriseService])
], EntrepriseController);
//# sourceMappingURL=entreprise.controller.js.map