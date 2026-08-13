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
exports.AuthentificationController = void 0;
const common_1 = require("@nestjs/common");
const authentification_service_1 = require("../services/authentification.service");
const auth_guard_1 = require("../guards/auth.guard");
const permissions_guard_1 = require("../guards/permissions.guard");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
const get_user_decorator_1 = require("../../../../common/decorators/get-user.decorator");
const dto_1 = require("../dto");
const Public_decoration_1 = require("../decorators/Public.decoration");
const swagger_1 = require("@nestjs/swagger");
const resend_Verification_Email_dto_1 = require("../dto/request/resend-Verification-Email.dto");
const refreshToken_guard_1 = require("../guards/refreshToken.guard");
const user_dto_1 = require("../../user/dto/request/user.dto");
const swagger_2 = require("@nestjs/swagger");
const update_profile_dto_1 = require("../dto/request/update-profile.dto");
const change_password_dto_1 = require("../dto/request/change-password.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const controllers_controller_1 = require("../../user/controllers/controllers.controller");
const nodePath = __importStar(require("path"));
let AuthentificationController = class AuthentificationController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(createUserDto, actorId, req) {
        return await this.authService.register(createUserDto, actorId);
    }
    async verifyEmail(dto, response) {
        const result = await this.authService.verifyEmail(dto);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        };
        response.cookie('access_token', result.accessToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        response.cookie('refresh_token', result.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            message: result.message,
            user: result.user
        };
    }
    async resendVerificationEmail(emailDto, req) {
        return await this.authService.resendVerificationEmail(emailDto, req);
    }
    async login(loginDto, response) {
        const result = await this.authService.login(loginDto);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        };
        response.cookie('access_token', result.accessToken, {
            ...cookieOptions,
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        response.cookie('refresh_token', result.refreshToken, {
            ...cookieOptions,
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            message: result.message,
            user: result.user,
        };
    }
    async refresh(req, response) {
        const accessToken = req.cookies['access_token'];
        const refreshToken = req.cookies['refresh_token'];
        if (!accessToken) {
            throw new common_1.UnauthorizedException("Cookie 'access_token' manquant.");
        }
        if (!refreshToken) {
            throw new common_1.UnauthorizedException("Cookie 'refresh_token' manquant.");
        }
        const tokens = await this.authService.refreshToken({ refreshToken }, accessToken);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        };
        response.cookie('access_token', tokens.accessToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        response.cookie('refresh_token', tokens.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { message: 'Session renouvelée avec succès.' };
    }
    async forgotPassword(forgotPasswordDto) {
        return await this.authService.forgotPassword(forgotPasswordDto);
    }
    async resetPassword(resetPasswordDto) {
        return await this.authService.resetPassword(resetPasswordDto);
    }
    async logout(req, response) {
        const userId = req.user.sub;
        await this.authService.logout(userId);
        response.clearCookie('access_token');
        response.clearCookie('refresh_token');
        return { message: 'Déconnexion réussie.' };
    }
    async getMe(req) {
        const userId = req.user.sub;
        return await this.authService.getMe(userId);
    }
    async updateMe(dto, req) {
        return await this.authService.updateProfile(req.user.sub, dto);
    }
    async changePassword(dto, req) {
        return await this.authService.changePassword(req.user.sub, dto);
    }
    async uploadMyProfilePicture(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        const userId = req.user.sub;
        const relativePath = nodePath
            .relative(nodePath.join(process.cwd(), 'uploads'), file.path)
            .split(nodePath.sep)
            .join('/');
        return this.authService.updateMyProfilePicture(userId, relativePath);
    }
};
exports.AuthentificationController = AuthentificationController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('authentification:create'),
    (0, swagger_2.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiOperation)({ summary: 'Inscription d\'un nouvel utilisateur (Admin/Manager)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Utilisateur créé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données de validation incorrectes.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('sub')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto, String, Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "register", null);
__decorate([
    (0, Public_decoration_1.Public)(),
    (0, common_1.Get)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier l\'adresse email d\'un utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email vérifié et cookies de session générés.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Token de vérification invalide ou expiré.' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyEmailDto, Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "verifyEmail", null);
__decorate([
    (0, Public_decoration_1.Public)(),
    (0, common_1.Post)('resend-verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: "Renvoyer l'email de vérification" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nouveau lien envoyé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email déjà vérifié.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_Verification_Email_dto_1.ResendVerificationEmailDto, Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "resendVerificationEmail", null);
__decorate([
    (0, Public_decoration_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Connexion utilisateur et génération des tokens' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Connexion réussie. Retourne les informations utilisateur et les tokens.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Identifiants invalides ou compte non vérifié/désactivé.'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "login", null);
__decorate([
    (0, Public_decoration_1.Public)(),
    (0, common_1.UseGuards)(refreshToken_guard_1.RefreshTokenGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('refresh'),
    (0, swagger_2.ApiCookieAuth)('refresh_token'),
    (0, swagger_1.ApiOperation)({ summary: 'Renouveler l\'access_token à l\'aide du refresh_token stocké dans les cookies' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens renouvelés avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Cookies manquants ou invalides.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "refresh", null);
__decorate([
    (0, Public_decoration_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Demander un lien de réinitialisation de mot de passe' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Réponse générique envoyée pour des raisons de sécurité.'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "forgotPassword", null);
__decorate([
    (0, Public_decoration_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Réinitialiser le mot de passe avec un token valide' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Mot de passe réinitialisé avec succès.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Token invalide, expiré, ou nouveau mot de passe identique à l’ancien.'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_2.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiOperation)({ summary: 'Déconnexion de l\'utilisateur et suppression des cookies' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Déconnexion réussie et cookies vidés.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les informations de l’utilisateur connecté' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profil récupéré avec succès.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Utilisateur non trouvé en base.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Jeton d’accès invalide ou expiré.'
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "getMe", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_2.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour son propre profil' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil mis à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_profile_dto_1.UpdateProfileDto, Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "updateMe", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_2.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiOperation)({ summary: 'Changer son mot de passe (utilisateur connecté)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mot de passe changé avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Mot de passe actuel incorrect ou nouveau mot de passe invalide.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordProfileDto, Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('me/profile-picture'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_2.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Photo de profil de l\'utilisateur connecté (Formats acceptés : JPG, JPEG, PNG. Poids max : 2 Mo)',
        schema: {
            type: 'object',
            properties: {
                profilePicture: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Téléverser sa propre photo de profil' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Photo de profil mise à jour avec succès.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Fichier absent, format invalide ou taille supérieure à 2 Mo.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié.' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profilePicture', {
        storage: (0, multer_1.diskStorage)({
            destination: controllers_controller_1.PROFILE_PICTURE_DIR,
            filename: (_req, file, cb) => {
                const ext = nodePath.extname(file.originalname).toLowerCase();
                cb(null, `profile_${Date.now()}${ext}`);
            },
        }),
        fileFilter: (_req, file, cb) => {
            const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowed.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Seuls les formats JPG et PNG sont acceptés'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 2 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthentificationController.prototype, "uploadMyProfilePicture", null);
exports.AuthentificationController = AuthentificationController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [authentification_service_1.AuthentificationService])
], AuthentificationController);
//# sourceMappingURL=authentification.controller.js.map