"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RefreshTokenGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
let RefreshTokenGuard = RefreshTokenGuard_1 = class RefreshTokenGuard extends (0, passport_1.AuthGuard)('jwt-refresh') {
    logger = new common_1.Logger(RefreshTokenGuard_1.name);
    handleRequest(err, user, info) {
        console.log('\n=========================================');
        console.log('🛡️ --- REFRESH TOKEN GUARD TRACE ---');
        console.log(`ℹ️ info: ${JSON.stringify(info)}`);
        console.log(`👤 user: ${JSON.stringify(user)}`);
        console.log(`❌ err: ${JSON.stringify(err)}`);
        console.log('=========================================\n');
        this.logger.log(`🛡️ --- REFRESH TOKEN GUARD ---`);
        this.logger.log(`🛡️ --- REFRESH TOKEN GUARD ---`);
        this.logger.log(`ℹ️ info: ${JSON.stringify(info)}`);
        this.logger.log(`👤 user: ${JSON.stringify(user)}`);
        this.logger.log(`❌ err: ${JSON.stringify(err)}`);
        if (info?.name === 'TokenExpiredError') {
            console.log(`⏰ ÉCHEC : Refresh token expiré.`);
            this.logger.log(`⏰ ÉCHEC : Refresh token expiré.`);
            throw new common_1.UnauthorizedException('Votre session a expiré. Veuillez vous reconnecter.');
        }
        if (info?.name === 'JsonWebTokenError') {
            console.log(`⏰ ÉCHEC : Refresh token expiré.`);
            this.logger.log(`❌ ÉCHEC : Refresh token malformé.`);
            throw new common_1.UnauthorizedException('Refresh token invalide.');
        }
        if (err || !user) {
            throw err || new common_1.UnauthorizedException('Accès refusé.');
        }
        return user;
    }
};
exports.RefreshTokenGuard = RefreshTokenGuard;
exports.RefreshTokenGuard = RefreshTokenGuard = RefreshTokenGuard_1 = __decorate([
    (0, common_1.Injectable)()
], RefreshTokenGuard);
//# sourceMappingURL=refreshToken.guard.js.map