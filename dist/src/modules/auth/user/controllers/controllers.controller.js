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
exports.UserController = exports.PROFILE_PICTURE_DIR = void 0;
const common_1 = require("@nestjs/common");
const services_service_1 = require("../services/services.service");
const user_dto_1 = require("../dto/request/user.dto");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const user_filters_dto_1 = require("../dto/request/user-filters.dto");
const permissions_decorator_1 = require("../../authentification/decorators/permissions.decorator");
const permissions_guard_1 = require("../../authentification/guards/permissions.guard");
const auth_guard_1 = require("../../authentification/guards/auth.guard");
const client_1 = require("@prisma/client");
const auth_log_service_1 = require("../../log/auth-log.service");
const require_contrat_decorator_1 = require("../../../../common/decorators/require-contrat.decorator");
const user_response_dto_1 = require("../dto/response/user-response.dto");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const nodePath = __importStar(require("path"));
const fs = __importStar(require("fs"));
exports.PROFILE_PICTURE_DIR = nodePath.join(process.cwd(), 'uploads', 'profile-pictures');
fs.mkdirSync(exports.PROFILE_PICTURE_DIR, { recursive: true });
let UserController = class UserController {
    userService;
    authLog;
    constructor(userService, authLog) {
        this.userService = userService;
        this.authLog = authLog;
    }
    async findAll(filters, req) {
        const actorId = req.user.sub;
        return this.userService.findAll(filters, actorId);
    }
    async findOne(id, req) {
        const actorId = req.user.sub;
        return await this.userService.findOne(id, actorId);
    }
    async findByEmail(email, req) {
        const actorId = req.user.sub;
        const user = await this.userService.findByEmail(email, false);
        if (!user) {
            throw new common_1.NotFoundException(`Aucun utilisateur trouvé avec l'email : ${email}`);
        }
        this.authLog.log({
            actorId,
            module: client_1.AuthModule.USER,
            action: 'SEARCH_USER_BY_EMAIL',
            message: `Recherche de l'utilisateur par email : ${email}`,
            state: client_1.State.SUCCESS,
        }).catch(() => { });
        return user;
    }
    async update(id, dto, req) {
        const actorId = req.user.sub;
        return await this.userService.update(id, dto, actorId);
    }
    async archive(id, req) {
        const actorId = req.user.sub;
        return await this.userService.archive(id, actorId);
    }
    async restore(id, req) {
        const actorId = req.user.sub;
        return await this.userService.restore(id, actorId);
    }
    async getUserLogs(id, page = 1, limit = 20) {
        return await this.userService.getUserLogs(id, page, limit);
    }
    async uploadProfilePicture(id, file, req) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        const actorId = req.user.sub;
        const relativePath = nodePath
            .relative(nodePath.join(process.cwd(), 'uploads'), file.path)
            .split(nodePath.sep)
            .join('/');
        return this.userService.updateProfilePicture(id, relativePath, actorId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_3.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('user:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer la liste des utilisateurs',
        description: 'Retourne une liste paginée avec filtres (recherche, rôle, archive).'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste récupérée avec succès.',
        type: user_response_dto_1.PaginatedUserResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié (cookie absent ou expiré).' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes (\'user:read\' requis).' }),
    __param(0, (0, common_2.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_filters_dto_1.UserFiltersDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_3.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('user:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer un utilisateur par son ID',
        description: 'Permet de voir les détails d’un employé. Les admins voient tout, les users voient leur propre profil.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant unique de l\'utilisateur (UUID ou identifiant technique)', example: 'usr_abc123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur trouvé.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_3.Get)('by-email/:email'),
    (0, permissions_decorator_1.RequirePermissions)('user:read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Rechercher un utilisateur par email',
        description: 'Retourne les informations publiques d’un utilisateur via son adresse email.'
    }),
    (0, swagger_1.ApiParam)({ name: 'email', description: 'Adresse email professionnelle ou personnelle ciblée', example: 'heidi.dev@ndolecam.com' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur trouvé.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Aucun utilisateur trouvé avec cet email.' }),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findByEmail", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('user:update'),
    (0, require_contrat_decorator_1.RequireContratBoth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Mettre à jour un utilisateur',
        description: 'Permet de modifier les informations d’un utilisateur. Les admins peuvent tout modifier, les utilisateurs uniquement leur propre profil.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de l\'utilisateur à modifier', example: 'usr_abc123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Interdit : Tentative de modification d’un autre compte sans droits admin.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur ou Rôle introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('archive/:id'),
    (0, permissions_decorator_1.RequirePermissions)('user:archive'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Archiver un utilisateur',
        description: 'Effectue un archivage (soft-delete). Désactive le compte, réinitialise les tokens et bloque l’accès.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de l\'utilisateur à archiver', example: 'usr_abc123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur archivé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur introuvable.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'L’utilisateur est déjà archivé.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "archive", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, permissions_decorator_1.RequirePermissions)('user:restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Restaurer un utilisateur archivé',
        description: 'Réactive un compte précédemment archivé et lui redonne accès au système.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de l\'utilisateur à restaurer', example: 'usr_abc123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur restauré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur introuvable.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'L’utilisateur n’est pas archivé.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "restore", null);
__decorate([
    (0, common_3.Get)(':id/logs'),
    (0, permissions_decorator_1.RequirePermissions)('user:read_log'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Consulter les logs d’un utilisateur',
        description: 'Retourne une liste paginée des actions d\'audit effectuées par un utilisateur.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de l\'utilisateur ciblé par l\'historique', example: 'usr_abc123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historique récupéré avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur introuvable.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_2.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserLogs", null);
__decorate([
    (0, common_1.Post)(':id/profile-picture'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('user:update'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Photo de profil de l\'utilisateur (Formats acceptés : JPG, JPEG, PNG. Poids max : 2 Mo)',
        schema: {
            type: 'object',
            properties: {
                profilePicture: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Téléverser et remplacer la photo de profil d\'un utilisateur',
        description: 'Si une ancienne photo existe sur le stockage, elle sera automatiquement supprimée physiquement pour éviter l\'accumulation de fichiers orphelins.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de l\'utilisateur ciblé', example: 'usr_abc123xyz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Photo de profil téléversée et mise à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Fichier absent, format invalide ou taille supérieure à 2 Mo.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur introuvable.' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profilePicture', {
        storage: (0, multer_1.diskStorage)({
            destination: exports.PROFILE_PICTURE_DIR,
            filename: (_req, file, cb) => {
                const ext = nodePath.extname(file.originalname).toLowerCase();
                const filename = `profile_${Date.now()}${ext}`;
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
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadProfilePicture", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Gestion des Utilisateurs'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [services_service_1.UserService,
        auth_log_service_1.AuthLogService])
], UserController);
//# sourceMappingURL=controllers.controller.js.map