"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsenceModule = void 0;
const common_1 = require("@nestjs/common");
const absence_controller_1 = require("./controllers/absence.controller");
const absence_service_1 = require("./services/absence.service");
const prisma_module_1 = require("../../../prisma/prisma.module");
const jwt_1 = require("@nestjs/jwt");
const rh_log_service_1 = require("../log/rh-log.service");
const rh_log_controller_1 = require("../log/rh-log.controller");
const realtime_module_1 = require("../../commerce/realtime/realtime.module");
let AbsenceModule = class AbsenceModule {
};
exports.AbsenceModule = AbsenceModule;
exports.AbsenceModule = AbsenceModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, jwt_1.JwtModule, realtime_module_1.RealtimeModule],
        controllers: [absence_controller_1.AbsenceController, rh_log_controller_1.RhLogController],
        providers: [absence_service_1.AbsenceService, rh_log_service_1.RhLogService],
        exports: [absence_service_1.AbsenceService],
    })
], AbsenceModule);
//# sourceMappingURL=absence.module.js.map