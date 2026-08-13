"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthentificationModule = void 0;
const common_1 = require("@nestjs/common");
const authentification_service_1 = require("./services/authentification.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mail_module_1 = require("./mail/mail.module");
const authentification_controller_1 = require("./controllers/authentification.controller");
const jwt_refresh_strategy_1 = require("./strategies/jwt-refresh.strategy");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const refreshToken_guard_1 = require("./guards/refreshToken.guard");
const user_module_1 = require("../user/user.module");
const auth_log_service_1 = require("../log/auth-log.service");
const auth_log_controller_1 = require("../log/auth-log.controller");
const realtime_module_1 = require("../../commerce/realtime/realtime.module");
let AuthentificationModule = class AuthentificationModule {
};
exports.AuthentificationModule = AuthentificationModule;
exports.AuthentificationModule = AuthentificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            realtime_module_1.RealtimeModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule, user_module_1.UserModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const secret = configService.get('JWT_SECRET');
                    const expiresIn = configService.get('JWT_EXPIRATION');
                    if (!secret || !expiresIn) {
                        throw new Error('JWT_SECRET or JWT_EXPIRATION is not defined in .env');
                    }
                    return {
                        secret: secret,
                        signOptions: {
                            expiresIn: expiresIn,
                        },
                    };
                },
            }),
            mail_module_1.MailModule,
            user_module_1.UserModule,
        ],
        controllers: [authentification_controller_1.AuthentificationController, auth_log_controller_1.AuthLogController],
        providers: [authentification_service_1.AuthentificationService, jwt_refresh_strategy_1.JwtRefreshStrategy, jwt_strategy_1.JwtStrategy, refreshToken_guard_1.RefreshTokenGuard, auth_log_service_1.AuthLogService],
        exports: [authentification_service_1.AuthentificationService, jwt_1.JwtModule],
    })
], AuthentificationModule);
//# sourceMappingURL=authentification.module.js.map