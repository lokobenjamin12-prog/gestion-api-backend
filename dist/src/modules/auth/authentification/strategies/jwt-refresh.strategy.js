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
var JwtRefreshStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtRefreshStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
let JwtRefreshStrategy = JwtRefreshStrategy_1 = class JwtRefreshStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-refresh') {
    configService;
    prisma;
    logger = new common_1.Logger(JwtRefreshStrategy_1.name);
    constructor(configService, prisma) {
        super({
            jwtFromRequest: (req) => {
                const token = req?.cookies?.['refresh_token'];
                if (!token)
                    return null;
                return token;
            },
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
        this.configService = configService;
        this.prisma = prisma;
    }
    async validate(req, payload) {
        this.logger.log(`🛡️ --- JwtRefreshStrategy : VALIDATION ---`);
        const refreshToken = req?.cookies?.['refresh_token'];
        if (!refreshToken) {
            this.logger.log(`❌ ÉCHEC : Refresh token manquant dans le cookie.`);
            throw new common_1.UnauthorizedException('Refresh token manquant.');
        }
        this.logger.log(`[2/5] 🔍 Recherche de l'utilisateur: ${payload.sub}`);
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { role: true },
        });
        if (!user || !user.refreshToken) {
            this.logger.log(`❌ ÉCHEC : Utilisateur introuvable ou session invalide.`);
            throw new common_1.UnauthorizedException('Session invalide. Veuillez vous reconnecter.');
        }
        if (!user.active || user.status === client_1.AccountStatus.DEACTIVATED) {
            this.logger.log(`🛑 ÉCHEC : Compte désactivé pour: ${user.email}`);
            throw new common_1.UnauthorizedException('Votre compte a été désactivé.');
        }
        this.logger.log(`[5/5] 🔐 Comparaison du refresh token avec le hash en base...`);
        const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isRefreshTokenMatching) {
            this.logger.log(`❌ ÉCHEC : Refresh token révoqué ou invalide pour: ${user.email}`);
            throw new common_1.UnauthorizedException('Refresh token invalide ou révoqué.');
        }
        this.logger.log(`✅ Refresh token valide pour: ${user.email}`);
        const { password, emailToken, emailTokenExpires, ...safeUser } = user;
        return { ...safeUser, refreshToken };
    }
};
exports.JwtRefreshStrategy = JwtRefreshStrategy;
exports.JwtRefreshStrategy = JwtRefreshStrategy = JwtRefreshStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtRefreshStrategy);
//# sourceMappingURL=jwt-refresh.strategy.js.map