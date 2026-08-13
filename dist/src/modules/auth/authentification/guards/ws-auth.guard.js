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
var WsAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const websockets_1 = require("@nestjs/websockets");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../../../prisma/prisma.service");
let WsAuthGuard = WsAuthGuard_1 = class WsAuthGuard {
    jwtService;
    configService;
    prisma;
    logger = new common_1.Logger(WsAuthGuard_1.name);
    constructor(jwtService, configService, prisma) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const client = context.switchToWs().getClient();
        client.data.user = await this.authenticate(client);
        return true;
    }
    async authenticate(client) {
        const cookieHeader = client.handshake.headers.cookie;
        if (!cookieHeader) {
            throw new websockets_1.WsException("Aucun cookie fourni dans la requête.");
        }
        const accessToken = this.extractCookie(cookieHeader, 'access_token');
        if (!accessToken) {
            throw new websockets_1.WsException("Le cookie d'authentification 'access_token' est manquant.");
        }
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(accessToken, {
                secret: this.configService.get('JWT_SECRET'),
            });
        }
        catch (error) {
            throw new websockets_1.WsException('Token invalide ou expiré.');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { accessToken: true, active: true, status: true },
        });
        if (!user || !user.accessToken) {
            throw new websockets_1.WsException('Session invalide. Veuillez vous reconnecter.');
        }
        if (!user.active || user.status === client_1.AccountStatus.DEACTIVATED) {
            throw new websockets_1.WsException('Votre compte a été désactivé.');
        }
        const isTokenMatching = await bcrypt.compare(accessToken, user.accessToken);
        if (!isTokenMatching) {
            throw new websockets_1.WsException('Token révoqué ou invalide.');
        }
        return payload;
    }
    extractCookie(cookieHeader, name) {
        const match = cookieHeader
            .split(';')
            .map((part) => part.trim())
            .find((part) => part.startsWith(`${name}=`));
        return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
    }
};
exports.WsAuthGuard = WsAuthGuard;
exports.WsAuthGuard = WsAuthGuard = WsAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], WsAuthGuard);
//# sourceMappingURL=ws-auth.guard.js.map