"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesSessionModule = void 0;
const common_1 = require("@nestjs/common");
const controllers_controller_1 = require("./controllers/controllers.controller");
const services_service_1 = require("./services/services.service");
const jwt_1 = require("@nestjs/jwt");
const prisma_module_1 = require("../../../prisma/prisma.module");
const commerce_log_service_1 = require("../log/commerce-log.service");
const commerce_log_controller_1 = require("../log/commerce-log.controller");
const realtime_module_1 = require("../realtime/realtime.module");
let SalesSessionModule = class SalesSessionModule {
};
exports.SalesSessionModule = SalesSessionModule;
exports.SalesSessionModule = SalesSessionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule,
            prisma_module_1.PrismaModule,
            realtime_module_1.RealtimeModule,
        ],
        controllers: [controllers_controller_1.ControllersController, commerce_log_controller_1.CommerceLogController],
        providers: [services_service_1.ServicesService, commerce_log_service_1.CommerceLogService],
        exports: [services_service_1.ServicesService],
    })
], SalesSessionModule);
//# sourceMappingURL=sales-session.module.js.map