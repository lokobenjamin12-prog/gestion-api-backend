"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetardModule = void 0;
const common_1 = require("@nestjs/common");
const retard_service_1 = require("./services/retard.service");
const retard_controller_1 = require("./controllers/retard.controller");
const prisma_module_1 = require("../../../prisma/prisma.module");
const jwt_1 = require("@nestjs/jwt");
const rh_log_service_1 = require("../log/rh-log.service");
const rh_log_controller_1 = require("../log/rh-log.controller");
const realtime_module_1 = require("../../commerce/realtime/realtime.module");
let RetardModule = class RetardModule {
};
exports.RetardModule = RetardModule;
exports.RetardModule = RetardModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, jwt_1.JwtModule, realtime_module_1.RealtimeModule],
        controllers: [retard_controller_1.RetardController, rh_log_controller_1.RhLogController],
        providers: [retard_service_1.RetardService, rh_log_service_1.RhLogService],
        exports: [retard_service_1.RetardService]
    })
], RetardModule);
//# sourceMappingURL=retard.module.js.map