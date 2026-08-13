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
var AuthentificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthentificationService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const services_service_1 = require("../../user/services/services.service");
const auth_log_service_1 = require("../../log/auth-log.service");
const index_1 = require("../dto/index");
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
const SALT_ROUNDS = 12;
const EMAIL_TOKEN_EXPIRY_HOURS = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const AUTH_MODULE = client_1.AuthModule.AUTH;
let AuthentificationService = AuthentificationService_1 = class AuthentificationService {
    prisma;
    jwtService;
    configService;
    mailService;
    userService;
    authLog;
    realtimeGateway;
    constructor(prisma, jwtService, configService, mailService, userService, authLog, realtimeGateway) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.userService = userService;
        this.authLog = authLog;
        this.realtimeGateway = realtimeGateway;
    }
    logger = new common_1.Logger(AuthentificationService_1.name);
    async register(dto, actorId) {
        if (!actorId) {
            this.logger.warn(`Tentative de création bloquée : aucun administrateur connecté.`);
            throw new common_1.UnauthorizedException("Action interdite. Vous devez être connecté pour créer un nouvel utilisateur.");
        }
        const user = await this.prisma.$transaction(async (tx) => {
            return await this.userService.create(dto, actorId, tx);
        });
        try {
            if (user.emailToken) {
                await this.mailService.sendVerificationEmail(user.email, user.firstName, user.emailToken);
                this.logger.log(`📩 Email de vérification envoyé à : ${user.email}`);
            }
            else {
                this.logger.warn(`Utilisateur ${user.email} créé sans emailToken.`);
            }
        }
        catch (mailError) {
            this.logger.error(`Échec envoi mail à ${user.email}: ${mailError.message}`);
            await this.authLog.error({
                actorId,
                actorName: await this.authLog.resolveActorName(actorId),
                module: AUTH_MODULE,
                action: 'REGISTER_MAIL_FAILED',
                email: user.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Compte créé mais échec envoi mail de vérification à ${user.email}`,
            });
        }
        try {
            await this.authLog.info({
                actorId,
                actorName: await this.authLog.resolveActorName(actorId),
                module: AUTH_MODULE,
                action: 'REGISTER',
                entityId: user.id,
                entityName: user.email,
                email: user.email,
                apres: { email: user.email },
                message: `Nouvel utilisateur inscrit par ${actorId} : ${user.email}`,
            });
        }
        catch (logError) {
            this.logger.error(`Éche
        c enregistrement log de succès: ${logError.message}`);
        }
        return {
            message: 'Inscription réussie. Veuillez vérifier votre boîte mail.',
            user: this.sanitize(user),
        };
    }
    async verifyEmail(dto) {
        this.logger.log("📩 --- DÉBUT DE LA VÉRIFICATION D'EMAIL ---");
        const user = await this.prisma.user.findFirst({
            where: { emailToken: dto.token },
        });
        if (!user) {
            this.logger.log("❌ ÉCHEC : Token invalide.");
            await this.authLog.warn({
                module: AUTH_MODULE,
                action: 'VERIFY_EMAIL',
                state: client_1.State.FAILED,
                reason: client_1.Reason.BAD_REQUEST,
                message: 'Token de vérification email invalide',
            });
            throw new common_1.BadRequestException('Token de vérification invalide');
        }
        if (user.emailTokenExpires && user.emailTokenExpires < new Date()) {
            this.logger.log("⏰ ÉCHEC : Token expiré.");
            await this.authLog.warn({
                actorId: user.id,
                actorName: user.email,
                module: AUTH_MODULE,
                action: 'VERIFY_EMAIL',
                email: user.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.BAD_REQUEST,
                message: `Token expiré pour: ${user.email}`,
            });
            throw new common_1.BadRequestException('Le token a expiré. Veuillez en demander un nouveau.');
        }
        try {
            console.log("[3/6] 🛠️ Activation du compte dans Prisma...");
            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    verified: true,
                    status: client_1.AccountStatus.ACTIVE,
                    emailToken: null,
                    emailTokenExpires: null,
                },
                include: {
                    role: true,
                },
            });
            console.log("[4/6] 🔑 Génération des tokens...");
            const tokens = await this.generateTokens(updatedUser.id.toString(), updatedUser.email, updatedUser.role.nomRole);
            console.log("[5/6] 💾 Stockage du Refresh Token...");
            await this.setCurrentTokens(updatedUser.id.toString(), tokens.accessToken, tokens.refreshToken);
            console.log("[6/6] 📝 Log de succès...");
            await this.authLog.info({
                actorId: updatedUser.id,
                actorName: `${updatedUser.firstName} ${updatedUser.lastName}`,
                module: AUTH_MODULE,
                action: 'VERIFY_EMAIL',
                entityId: updatedUser.id,
                entityName: updatedUser.email,
                email: updatedUser.email,
                message: `Email vérifié et utilisateur connecté: ${updatedUser.email}`,
            });
            this.logger.log(`✨ Succès total pour : ${updatedUser.email}`);
            this.logger.log("🏁 --- FIN DE LA VÉRIFICATION D'EMAIL ---");
            return {
                message: 'Email vérifié avec succès. Votre compte est maintenant actif.',
                ...tokens,
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                }
            };
        }
        catch (error) {
            console.error("💥 ERREUR CRITIQUE lors de la validation du compte :", error.message);
            await this.authLog.critical({
                actorId: user.id,
                module: AUTH_MODULE,
                action: 'VERIFY_EMAIL_CRITICAL_ERROR',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Erreur système lors de la vérification de ${user.email}: ${error.message}`,
            });
            throw new common_1.InternalServerErrorException('Une erreur est survenue lors de l’activation de votre compte.');
        }
    }
    async setCurrentTokens(userId, accessToken, refreshToken) {
        this.logger.log(`🔑 --- DÉBUT : MISE À JOUR DU REFRESH TOKEN ---`);
        this.logger.log(`[1/3] ⚙️ Préparation du hachage pour l'utilisateur ID: ${userId}`);
        try {
            this.logger.log(`[2/3] 🔐 Génération du salt et hachage du refresh token...`);
            const refresh_salt = await bcrypt.genSalt();
            const hashedRefreshToken = await bcrypt.hash(refreshToken, refresh_salt);
            this.logger.log(`[2/4] 🔐 Hachage du access token...`);
            const access_salt = await bcrypt.genSalt();
            const hashedAccessToken = await bcrypt.hash(accessToken, access_salt);
            this.logger.log(`[3/3] 💾 Persistance du hash dans la base de données Prisma...`);
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    refreshToken: hashedRefreshToken,
                    accessToken: hashedAccessToken,
                },
            });
            this.logger.log(`✅ Success : Refresh Token et Access Token haché et enregistré avec succès.`);
            this.logger.log(`Hash du Refresh Token  et Access Token mis à jour pour l'utilisateur: ${userId}`);
            this.logger.log(`🏁 --- FIN : MISE À JOUR DU REFRESH TOKEN ET DE L'ACCESS TOKEN ---`);
        }
        catch (error) {
            this.logger.log(`❌ ERREUR CRITIQUE : Échec de l'enregistrement du Refresh Token et de l'Access Token !`);
            this.logger.error(`Erreur lors de l'enregistrement du Refresh Token et de l'Access Token pour ${userId}`, error.stack);
            await this.authLog.critical({
                actorId: userId,
                module: AUTH_MODULE,
                action: 'SET_CURRENT_TOKENS_FAILED',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Erreur lors de l'enregistrement des tokens pour ${userId}`,
            });
            throw error;
        }
    }
    async resendVerificationEmail(emailDto, req) {
        this.logger.log("🔄 --- DÉBUT : RENVOI DE L'EMAIL DE VÉRIFICATION ---");
        const user = await this.prisma.user.findUnique({
            where: { email: emailDto.email.toLowerCase() },
        });
        if (!user) {
            this.logger.log("❌ ÉCHEC : Utilisateur non trouvé.");
            await this.authLog.warn({
                module: AUTH_MODULE,
                action: 'RESEND_VERIFICATION_FAILED',
                email: emailDto.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.NOT_FOUND,
                message: `Tentative de renvoi pour un email inexistant: ${emailDto.email}`,
            });
            throw new common_1.NotFoundException("Utilisateur non trouvé. Veillez vérifier si votre email est correct!");
        }
        if (user.verified) {
            this.logger.log("⚠️ ÉCHEC : Déjà vérifié.");
            await this.authLog.info({
                actorId: user.id,
                module: AUTH_MODULE,
                action: 'RESEND_VERIFICATION_SKIPPED',
                email: user.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.BAD_REQUEST,
                message: `Tentative de renvoi pour un compte déjà vérifié: ${user.email}`,
            });
            throw new common_1.BadRequestException('Cet email est déjà vérifié!');
        }
        const emailToken = crypto.randomBytes(32).toString('hex');
        const emailTokenExpires = new Date(Date.now() + EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        try {
            this.logger.log("[4/6] 💾 Mise à jour du token dans Prisma...");
            await this.prisma.user.update({
                where: { id: user.id },
                data: { emailToken, emailTokenExpires },
            });
            this.logger.log(`[5/6] 📧 Tentative d'envoi à : ${user.email}`);
            try {
                await this.mailService.sendVerificationEmail(user.email, user.firstName, emailToken);
                this.logger.log("📩 Email expédié avec succès.");
            }
            catch (mailError) {
                this.logger.error("💥 ERREUR EMAIL : Le token est mis à jour mais l'envoi a échoué.");
                await this.authLog.error({
                    actorId: user.id,
                    module: AUTH_MODULE,
                    action: 'RESEND_VERIFICATION_MAIL_FAILED',
                    email: user.email,
                    state: client_1.State.FAILED,
                    reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                    message: `Échec de l'envoi du mail de renvoi à ${user.email}`,
                });
                throw new common_1.InternalServerErrorException("Erreur lors de l'envoi de l'email. Veuillez réessayer dans quelques instants.");
            }
            await this.authLog.info({
                actorId: user.id,
                module: AUTH_MODULE,
                action: 'RESEND_VERIFICATION',
                email: user.email,
                message: `Renvoi du mail de vérification réussi : ${user.email}`,
            });
            return { message: 'Un nouveau lien de vérification a été envoyé.' };
        }
        catch (error) {
            this.logger.log("❌ ERREUR lors du processus de renvoi.");
            if (error instanceof common_1.InternalServerErrorException)
                throw error;
            await this.authLog.critical({
                actorId: user?.id,
                module: AUTH_MODULE,
                action: 'RESEND_VERIFICATION_CRASH',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Crash technique lors du renvoi pour ${emailDto.email} : ${error.message}`,
            });
            throw new common_1.InternalServerErrorException("Une erreur technique est survenue.");
        }
    }
    async login(dto) {
        this.logger.log("🔑 --- DÉBUT DU PROCESSUS DE CONNEXION ---");
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true },
                        },
                    },
                },
            },
        });
        if (!user) {
            this.logger.log(`❌ ÉCHEC : Utilisateur non trouvé.`);
            await this.authLog.warn({
                module: AUTH_MODULE,
                action: 'LOGIN',
                email: dto.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.UNAUTHORIZED,
                message: `Tentative échouée : email "${dto.email}" non trouvé.`,
            });
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const isPasswordMatching = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordMatching) {
            this.logger.log("❌ ÉCHEC : Mot de passe incorrect.");
            await this.authLog.warn({
                module: AUTH_MODULE,
                action: 'LOGIN',
                email: dto.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.UNAUTHORIZED,
                message: `Mot de passe incorrect pour l'email: ${dto.email}`,
            });
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        if (!user.verified) {
            this.logger.log("⚠️ ÉCHEC : Email non vérifié.");
            await this.authLog.warn({
                actorId: user.id,
                module: AUTH_MODULE,
                action: 'LOGIN',
                email: user.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.UNAUTHORIZED,
                message: `Connexion refusée - email non vérifié: ${user.email}`,
            });
            throw new common_1.UnauthorizedException('Vous ne nous avez pas encore certifié que cette email est bien la votre. Veuillez consulter votre boite mail pour la vérification .');
        }
        if (!user.active || user.status === client_1.AccountStatus.DEACTIVATED) {
            this.logger.log("🛑 ÉCHEC : Compte inactif.");
            await this.authLog.warn({
                actorId: user.id,
                module: AUTH_MODULE,
                action: 'LOGIN',
                email: user.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.FORBIDDEN,
                message: `Connexion refusée - compte désactivé: ${user.email}`,
            });
            throw new common_1.UnauthorizedException('Votre compte a été désactivé.');
        }
        try {
            this.logger.log("[5/7] 🎟️ Génération des tokens JWT...");
            const tokens = await this.generateTokens(user.id.toString(), user.email, user.role.nomRole);
            this.logger.log("[6/7] 💾 Mise à jour du Refresh Token et de l'Access Token...");
            await this.setCurrentTokens(user.id.toString(), tokens.accessToken, tokens.refreshToken);
            this.logger.log("[7/7] 📝 Log de succès final...");
            await this.authLog.info({
                actorId: user.id,
                actorName: `${user.firstName} ${user.lastName}`,
                module: AUTH_MODULE,
                action: 'LOGIN',
                email: user.email,
                entityId: user.id,
                message: `Connexion réussie: ${user.email}`,
            });
            const { password: _, emailToken, emailTokenExpires, ...safeUser } = user;
            this.logger.log(`✅ Connexion validée pour : ${user.email}`);
            return {
                message: 'Connexion réussie.',
                user: safeUser,
                ...tokens,
            };
        }
        catch (error) {
            this.logger.error("💥 ERREUR SYSTÈME lors du login :", error.message);
            await this.authLog.critical({
                actorId: user.id,
                module: AUTH_MODULE,
                action: 'LOGIN_SYSTEM_ERROR',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Erreur critique lors de la finalisation du login pour ${user.email}`,
            });
            throw new common_1.InternalServerErrorException('Une erreur技术 est survenue lors de la connexion.');
        }
    }
    async refreshToken(dto, accessToken) {
        this.logger.log("🔄 --- DÉBUT : ROTATION DU TOKEN (REFRESH) ---");
        try {
            this.logger.log("[1/7] 📜 Vérification de la signature et de l'expiration du JWT...");
            let payload;
            try {
                payload = this.jwtService.verify(dto.refreshToken, {
                    secret: this.configService.get('JWT_REFRESH_SECRET'),
                });
                this.logger.log(`✅ Token JWT techniquement valide. ID utilisateur extrait : ${payload.sub}`);
            }
            catch (jwtError) {
                this.logger.log(`❌ ÉCHEC : Le token est expiré ou mal signé. Message : ${jwtError.message}`);
                this.logger.warn(`Échec de vérification JWT: ${jwtError.message}`);
                await this.authLog.warn({
                    module: AUTH_MODULE,
                    action: 'REFRESH_TOKEN_INVALID',
                    state: client_1.State.FAILED,
                    reason: client_1.Reason.UNAUTHORIZED,
                    message: `Échec technique du refresh token : ${jwtError.message}`,
                });
                throw new common_1.UnauthorizedException('Session expirée ou invalide');
            }
            this.logger.log(`[2/7] 🔍 Recherche de l'utilisateur ID: ${payload.sub}...`);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: { role: true },
            });
            if (!user) {
                this.logger.log("❌ ÉCHEC : Utilisateur introuvable en base.");
                throw new common_1.UnauthorizedException('Accès refusé');
            }
            this.logger.log(`[3/7] 🛡️ Vérification du statut du compte pour : ${user.email}`);
            if (!user.active || user.status === client_1.AccountStatus.DEACTIVATED) {
                this.logger.log(`⚠️ ÉCHEC : Compte non actif (Statut actuel : ${user.status})`);
                await this.authLog.warn({
                    actorId: user.id,
                    module: AUTH_MODULE,
                    action: 'REFRESH_TOKEN_INACTIVE',
                    email: user.email,
                    state: client_1.State.FAILED,
                    reason: client_1.Reason.FORBIDDEN,
                    message: `Tentative de refresh sur un compte non actif : ${user.email}`,
                });
                throw new common_1.UnauthorizedException('Votre compte n\'est pas actif');
            }
            this.logger.log("[4/7] 🔐 Vérification de l'existence d'une session en base de données...");
            if (!user.refreshToken || !user.accessToken) {
                this.logger.log("⚠️ ÉCHEC : Aucun token stocké (utilisateur probablement déconnecté).");
                throw new common_1.UnauthorizedException('Session non reconnue. Veuillez vous reconnecter.');
            }
            this.logger.log("[5/7] 🔍 Vérification que l'accessToken appartient à cet utilisateur...");
            const isAccessTokenMatching = await bcrypt.compare(accessToken, user.accessToken);
            if (!isAccessTokenMatching) {
                this.logger.log("🚨 ALERTE SÉCURITÉ : L'accessToken ne correspond pas à cet utilisateur !");
                await this.authLog.critical({
                    actorId: user.id,
                    module: AUTH_MODULE,
                    action: 'SECURITY_ALERT_ACCESS_TOKEN_MISMATCH',
                    email: user.email,
                    state: client_1.State.FAILED,
                    reason: client_1.Reason.FORBIDDEN,
                    message: `Alerte Sécurité : AccessToken ne correspond pas pour ${user.email}. Invalidation forcée.`,
                });
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { accessToken: null, refreshToken: null },
                });
                throw new common_1.UnauthorizedException('Action non autorisée');
            }
            this.logger.log("[6/7] ⚖️ Comparaison du refresh token fourni avec le hash stocké (Bcrypt)...");
            const isRefreshTokenMatching = await bcrypt.compare(dto.refreshToken, user.refreshToken);
            if (!isRefreshTokenMatching) {
                this.logger.log("🚨 ALERTE SÉCURITÉ : Le refresh token ne correspond pas au hash en base !");
                await this.authLog.critical({
                    actorId: user.id,
                    module: AUTH_MODULE,
                    action: 'SECURITY_ALERT_REFRESH_MISMATCH',
                    email: user.email,
                    state: client_1.State.FAILED,
                    reason: client_1.Reason.FORBIDDEN,
                    message: `Alerte Sécurité : Refresh Token non correspondant pour ${user.email}. Invalidation forcée.`,
                });
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { accessToken: null, refreshToken: null },
                });
                throw new common_1.UnauthorizedException('Action non autorisée');
            }
            this.logger.log("[7/7] 🌀 Rotation réussie ! Génération de la nouvelle paire de tokens...");
            await this.prisma.user.update({
                where: { id: user.id },
                data: { accessToken: null },
            });
            const tokens = await this.generateTokens(user.id.toString(), user.email, user.role.nomRole);
            this.logger.log("💾 Stockage de la nouvelle paire de tokens hachés...");
            await this.setCurrentTokens(user.id.toString(), tokens.accessToken, tokens.refreshToken);
            await this.authLog.info({
                actorId: user.id,
                actorName: `${user.firstName} ${user.lastName}`,
                module: AUTH_MODULE,
                action: 'REFRESH_TOKEN_SUCCESS',
                email: user.email,
                message: `Session renouvelée avec succès pour : ${user.email}`,
            });
            this.logger.log(`✨ Session renouvelée avec succès pour : ${user.email}`);
            this.logger.log("🏁 --- FIN : ROTATION DU TOKEN (REFRESH) ---");
            return tokens;
        }
        catch (error) {
            console.log('================================================ ');
            console.log('Refresh Token ERROR : ', error);
            console.log('================================================ ');
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            this.logger.error(`❌ Erreur système imprévue : ${error.message}`, error.stack);
            await this.authLog.critical({
                module: AUTH_MODULE,
                action: 'REFRESH_TOKEN_SYSTEM_ERROR',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Erreur système lors du refresh : ${error.message}`,
            });
            throw new common_1.InternalServerErrorException('Une erreur est survenue lors du renouvellement de la session');
        }
    }
    async updateHashedRefreshToken(userId, refreshToken) {
        try {
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(refreshToken, salt);
            await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hash } });
        }
        catch (error) {
            await this.authLog.critical({
                actorId: userId,
                module: AUTH_MODULE,
                action: 'UPDATE_HASH_REFRESH_FAILED',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Échec technique de la rotation du hash : ${error.message}`,
            });
            throw error;
        }
    }
    async forgotPassword(dto) {
        this.logger.log("🔑 --- DÉBUT : MOT DE PASSE OUBLIÉ ---");
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        const genericResponse = {
            message: 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.',
        };
        if (!user || !user.active) {
            await this.authLog.warn({
                module: AUTH_MODULE,
                action: 'FORGOT_PASSWORD_ATTEMPT',
                email: dto.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.NOT_FOUND,
                message: `Demande de reset pour un email non reconnu ou inactif : ${dto.email}`,
            });
            return genericResponse;
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        try {
            this.logger.log("[3/5] 💾 Stockage du token dans Prisma...");
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires,
                },
            });
            this.logger.log(`[4/5] 📧 Tentative d'envoi à : ${user.email}`);
            try {
                await this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
                this.logger.log("📩 Email envoyé avec succès.");
            }
            catch (mailError) {
                this.logger.error("💥 ERREUR MAIL : Impossible d'envoyer le lien de reset.");
                await this.authLog.error({
                    actorId: user.id,
                    module: AUTH_MODULE,
                    action: 'FORGOT_PASSWORD_MAIL_FAILED',
                    email: user.email,
                    state: client_1.State.FAILED,
                    reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                    message: `Échec envoi mail reset à ${user.email}: ${mailError.message}`,
                });
                return genericResponse;
            }
            await this.authLog.info({
                actorId: user.id,
                actorName: `${user.firstName} ${user.lastName}`,
                module: AUTH_MODULE,
                action: 'FORGOT_PASSWORD',
                email: user.email,
                message: `Demande de reset réussie pour: ${user.email}`,
            });
            return genericResponse;
        }
        catch (error) {
            this.logger.log("❌ ERREUR CRITIQUE lors du forgotPassword.");
            await this.authLog.critical({
                module: AUTH_MODULE,
                action: 'FORGOT_PASSWORD_ERROR',
                state: client_1.State.FAILED,
                message: `Erreur système pour l'email ${dto.email}: ${error.message}`,
            });
            return genericResponse;
        }
    }
    async resetPassword(dto) {
        this.logger.log("🔄 --- DÉBUT : RÉINITIALISATION DU MOT DE PASSE ---");
        const user = await this.prisma.user.findFirst({
            where: { resetPasswordToken: dto.token },
        });
        console.log("user", user);
        if (!user) {
            this.logger.log("❌ ÉCHEC : Token invalide.");
            await this.authLog.warn({
                module: AUTH_MODULE,
                action: 'RESET_PASSWORD',
                state: client_1.State.FAILED,
                reason: client_1.Reason.BAD_REQUEST,
                message: 'Token de réinitialisation inexistant',
            });
            throw new common_1.BadRequestException('Lien de réinitialisation invalide.');
        }
        if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
            console.log("⏰ ÉCHEC : Token expiré.");
            await this.authLog.warn({
                actorId: user.id,
                module: AUTH_MODULE,
                action: 'RESET_PASSWORD',
                email: user.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.BAD_REQUEST,
                message: `Token de réinitialisation expiré pour: ${user.email}`,
            });
            throw new common_1.BadRequestException('Le lien a expiré. Veuillez refaire une demande.');
        }
        const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
        if (isSamePassword) {
            this.logger.log("⚠️ ÉCHEC : Nouveau mot de passe identique à l'ancien.");
            throw new common_1.BadRequestException('Le nouveau mot de passe doit être différent de l\'actuel.');
        }
        try {
            this.logger.log("[4/7] 🔐 Hachage et [5/7] 💾 Mise à jour Prisma...");
            const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                },
            });
            try {
                this.logger.log(`[6/7] 📧 Envoi de la confirmation à : ${user.email}`);
                await this.mailService.sendPasswordChangedEmail(user.email, user.firstName);
            }
            catch (mailError) {
                console.error("⚠️ ALERTE : Mot de passe changé, mais échec de l'envoi de l'email de confirmation.");
                await this.authLog.error({
                    actorId: user.id,
                    module: AUTH_MODULE,
                    action: 'RESET_PASSWORD_MAIL_FAILED',
                    email: user.email,
                    state: client_1.State.FAILED,
                    reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                    message: `Mot de passe changé mais email non envoyé à ${user.email}`,
                });
            }
            await this.authLog.info({
                actorId: user.id,
                actorName: `${user.firstName} ${user.lastName}`,
                module: AUTH_MODULE,
                action: 'RESET_PASSWORD',
                email: user.email,
                message: `Réinitialisation réussie pour : ${user.email}`,
            });
            this.logger.log(`✨ Mot de passe mis à jour pour : ${user.email}`);
            return { message: 'Votre mot de passe a été réinitialisé avec succès.' };
        }
        catch (error) {
            this.logger.error(`💥 ERREUR CRITIQUE lors du resetPassword : ${error.message}`);
            await this.authLog.critical({
                actorId: user.id,
                module: AUTH_MODULE,
                action: 'RESET_PASSWORD_CRASH',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Échec technique majeur lors de la réinitialisation de ${user.email} : ${error.message}`,
            });
            throw new common_1.InternalServerErrorException('Une erreur technique est survenue.');
        }
    }
    async logout(userId) {
        this.logger.log("🚪 --- DÉBUT DU PROCESSUS DE DÉCONNEXION ---");
        try {
            this.logger.log(`[1/2] 🔐 Invalidation des tokens pour l'ID : ${userId}`);
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    accessToken: null,
                    refreshToken: null,
                },
            });
            this.logger.log(`[2/2] 📝 Enregistrement du log de déconnexion...`);
            await this.authLog.info({
                actorId: userId,
                actorName: await this.authLog.resolveActorName(userId),
                module: AUTH_MODULE,
                action: 'LOGOUT',
                message: 'Utilisateur déconnecté avec succès. Tokens invalidés en base.',
            });
            this.logger.log(`✅ Déconnexion réussie pour : ${userId}`);
            this.logger.log("🏁 --- FIN DU PROCESSUS DE DÉCONNEXION ---");
            return { message: 'Déconnexion réussie.' };
        }
        catch (error) {
            this.logger.error(`❌ ERREUR lors de la déconnexion : ${error.message}`);
            await this.authLog.critical({
                actorId: userId,
                module: AUTH_MODULE,
                action: 'LOGOUT_FAILED',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Échec technique de l'invalidation de session : ${error.message}`,
            });
            throw new common_1.InternalServerErrorException('Une erreur est survenue lors de la déconnexion.');
        }
    }
    async getMe(userId) {
        this.logger.log("👤 --- DÉBUT : RÉCUPÉRATION DU PROFIL (GET ME) ---");
        this.logger.log(`[1/2] 🔍 Recherche du profil en base pour l'ID : ${userId}`);
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: index_1.getMeSelect,
            });
            if (!user) {
                this.logger.warn(`❌ ÉCHEC : Utilisateur ID ${userId} introuvable alors qu'il est authentifié.`);
                await this.authLog.warn({
                    actorId: userId,
                    module: AUTH_MODULE,
                    action: 'GET_ME_FAILED',
                    state: client_1.State.FAILED,
                    reason: client_1.Reason.NOT_FOUND,
                    message: `Tentative de récupération de profil échouée : l'ID ${userId} n'existe plus en base.`,
                });
                throw new common_1.NotFoundException('Utilisateur introuvable');
            }
            this.logger.log(`✅ Succès : Profil de ${user.email} récupéré.`);
            this.logger.log("🏁 --- FIN : RÉCUPÉRATION DU PROFIL ---");
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            this.logger.error(`💥 ERREUR SYSTÈME lors du getMe : ${error.message}`);
            await this.authLog.critical({
                actorId: userId,
                module: AUTH_MODULE,
                action: 'GET_ME_ERROR',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Erreur système lors de la récupération du profil : ${error.message}`,
            });
            throw new common_1.InternalServerErrorException('Une erreur est survenue lors de la récupération de votre profil.');
        }
    }
    async updateProfile(userId, dto) {
        this.logger.log(`👤 --- DÉBUT : MISE À JOUR DU PROFIL (${userId}) ---`);
        const existing = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!existing) {
            throw new common_1.NotFoundException('Utilisateur introuvable');
        }
        try {
            const updated = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    ...(dto.firstName !== undefined && { firstName: dto.firstName }),
                    ...(dto.lastName !== undefined && { lastName: dto.lastName }),
                    ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
                    ...(dto.whatsappNumber !== undefined && { whatsappNumber: dto.whatsappNumber }),
                    ...(dto.adresse !== undefined && { adresse: dto.adresse }),
                },
                select: index_1.getMeSelect,
            });
            await this.authLog.info({
                actorId: userId,
                actorName: `${updated.firstName} ${updated.lastName}`,
                module: AUTH_MODULE,
                action: 'UPDATE_PROFILE',
                entityId: userId,
                entityName: updated.email,
                message: `Profil mis à jour par l'utilisateur lui-même : ${updated.email}`,
            });
            this.realtimeGateway.emitEntityChanged({ module: 'user', action: 'updated', id: userId });
            this.logger.log(`✅ Profil mis à jour pour : ${updated.email}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`💥 ERREUR lors de la mise à jour du profil : ${error.message}`);
            await this.authLog.critical({
                actorId: userId,
                module: AUTH_MODULE,
                action: 'UPDATE_PROFILE_ERROR',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Erreur système lors de la mise à jour du profil : ${error.message}`,
            });
            throw new common_1.InternalServerErrorException('Une erreur est survenue lors de la mise à jour de votre profil.');
        }
    }
    async changePassword(userId, dto) {
        this.logger.log(`🔑 --- DÉBUT : CHANGEMENT DE MOT DE PASSE (${userId}) ---`);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur introuvable');
        }
        const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            await this.authLog.warn({
                actorId: userId,
                module: AUTH_MODULE,
                action: 'CHANGE_PASSWORD',
                email: user.email,
                state: client_1.State.FAILED,
                reason: client_1.Reason.UNAUTHORIZED,
                message: `Mot de passe actuel incorrect lors d'une tentative de changement : ${user.email}`,
            });
            throw new common_1.BadRequestException('Mot de passe actuel incorrect.');
        }
        const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
        if (isSamePassword) {
            throw new common_1.BadRequestException('Le nouveau mot de passe doit être différent de l\'actuel.');
        }
        try {
            const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                    accessToken: null,
                    refreshToken: null,
                },
            });
            try {
                await this.mailService.sendPasswordChangedEmail(user.email, user.firstName);
            }
            catch (mailError) {
                this.logger.error(`⚠️ Mot de passe changé mais échec de l'envoi de l'email de confirmation à ${user.email}.`);
            }
            await this.authLog.info({
                actorId: userId,
                actorName: `${user.firstName} ${user.lastName}`,
                module: AUTH_MODULE,
                action: 'CHANGE_PASSWORD',
                email: user.email,
                message: `Mot de passe changé par l'utilisateur lui-même : ${user.email}`,
            });
            this.logger.log(`✅ Mot de passe changé pour : ${user.email}`);
            return { message: 'Votre mot de passe a été changé avec succès. Veuillez vous reconnecter.' };
        }
        catch (error) {
            this.logger.error(`💥 ERREUR CRITIQUE lors du changement de mot de passe : ${error.message}`);
            await this.authLog.critical({
                actorId: userId,
                module: AUTH_MODULE,
                action: 'CHANGE_PASSWORD_CRASH',
                state: client_1.State.FAILED,
                reason: client_1.Reason.INTERNAL_SERVER_ERROR,
                message: `Échec technique du changement de mot de passe pour ${user.email} : ${error.message}`,
            });
            throw new common_1.InternalServerErrorException('Une erreur technique est survenue.');
        }
    }
    async updateMyProfilePicture(userId, relativePath) {
        const updated = await this.userService.updateProfilePicture(userId, relativePath, userId);
        return this.sanitize(updated);
    }
    async generateTokens(userId, email, nomrole) {
        this.logger.log("🎟️ --- DÉBUT : GÉNÉRATION DES TOKENS JWT ---");
        this.logger.log(`[1/3] 📝 Préparation du payload pour : ${email}`);
        const payload = { sub: userId, email, nomrole };
        try {
            this.logger.log("[2/3] ✍️ Signature simultanée de l'Access Token et du Refresh Token...");
            const [accessToken, refreshToken] = await Promise.all([
                this.jwtService.signAsync(payload, {
                    secret: this.configService.get('JWT_SECRET'),
                    expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
                }),
                this.jwtService.signAsync(payload, {
                    secret: this.configService.get('JWT_REFRESH_SECRET'),
                    expiresIn: this.configService.get('JWT_REFRESH_SECRET_EXPIRATION', '7d'),
                }),
            ]);
            this.logger.log("✅ Signature réussie. Les secrets JWT ont été appliqués.");
            this.logger.log(`[3/3] 📤 Pair de tokens prête pour l'ID : ${userId}`);
            this.logger.log("🏁 --- FIN : GÉNÉRATION DES TOKENS JWT ---");
            return { accessToken, refreshToken };
        }
        catch (error) {
            this.logger.log("💥 ERREUR CRITIQUE lors de la signature JWT !");
            this.logger.log(`🧐 Détails : Vérifiez vos clés secrètes dans le fichier .env`);
            throw error;
        }
    }
    sanitize(user) {
        if (!user)
            return null;
        const { password, refreshToken, emailToken, ...safeUser } = user;
        return safeUser;
    }
};
exports.AuthentificationService = AuthentificationService;
exports.AuthentificationService = AuthentificationService = AuthentificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService,
        services_service_1.UserService,
        auth_log_service_1.AuthLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], AuthentificationService);
//# sourceMappingURL=authentification.service.js.map