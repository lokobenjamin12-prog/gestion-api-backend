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
var AuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const Public_decoration_1 = require("../decorators/Public.decoration");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../../../prisma/prisma.service");
let AuthGuard = AuthGuard_1 = class AuthGuard {
    reflector;
    jwtService;
    configService;
    prisma;
    logger = new common_1.Logger(AuthGuard_1.name);
    constructor(reflector, jwtService, configService, prisma) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(Public_decoration_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        if (!request.headers.cookie) {
            this.logger.log(`❌ ÉCHEC : Aucun cookie fourni dans la requête.`);
            throw new common_1.UnauthorizedException('Aucun cookie fourni dans la requête.');
        }
        const accessToken = request.cookies['access_token'];
        if (!accessToken) {
            this.logger.log(`❌ ÉCHEC : Cookie 'access_token' manquant.`);
            throw new common_1.UnauthorizedException("Le cookie d'authentification 'access_token' est manquant.");
        }
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(accessToken, {
                secret: this.configService.get('JWT_SECRET'),
            });
            this.logger.log(`✅ Signature JWT valide pour: ${payload.email}`);
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                this.logger.log(`⏰ ÉCHEC : Access token expiré.`);
                throw new common_1.UnauthorizedException('Votre session a expiré. Veuillez rafraîchir votre token.');
            }
            if (error.name === 'JsonWebTokenError') {
                this.logger.log(`❌ ÉCHEC : Access token malformé ou invalide.`);
                throw new common_1.UnauthorizedException('Token invalide.');
            }
            if (error.name === 'NotBeforeError') {
                this.logger.log(`❌ ÉCHEC : Token utilisé avant sa date d'activation.`);
                throw new common_1.UnauthorizedException('Token non encore actif.');
            }
            throw new common_1.UnauthorizedException("Erreur d'authentification.");
        }
        this.logger.log(`[5/5] 🔍 Vérification du token en base de données...`);
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { accessToken: true, active: true, status: true },
        });
        if (!user || !user.accessToken) {
            this.logger.log(`❌ ÉCHEC : Token introuvable en base — session expirée ou déconnexion détectée.`);
            throw new common_1.UnauthorizedException('Session invalide. Veuillez vous reconnecter.');
        }
        if (!user.active || user.status === client_1.AccountStatus.DEACTIVATED) {
            this.logger.log(`🛑 ÉCHEC : Compte désactivé.`);
            throw new common_1.UnauthorizedException('Votre compte a été désactivé.');
        }
        const isTokenMatching = await bcrypt.compare(accessToken, user.accessToken);
        if (!isTokenMatching) {
            this.logger.log(`🚨 ALERTE : Token ne correspond pas au hash en base — possible vol de session.`);
            throw new common_1.UnauthorizedException('Token révoqué ou invalide.');
        }
        this.logger.log(`✅ Token valide et actif en base pour: ${payload.email}`);
        request.user = payload;
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = AuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map