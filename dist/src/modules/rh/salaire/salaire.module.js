"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaireModule = void 0;
const common_1 = require("@nestjs/common");
const salaire_controller_1 = require("./controllers/salaire.controller");
const salaire_service_1 = require("./services/salaire.service");
const prisma_module_1 = require("../../../prisma/prisma.module");
const absence_module_1 = require("../absence/absence.module");
const jwt_1 = require("@nestjs/jwt");
const pdf_generator_module_1 = require("../../admin/pdf-generator/pdf-generator.module");
const entreprise_module_1 = require("../../commerce/entreprise/entreprise.module");
const rh_log_service_1 = require("../log/rh-log.service");
const rh_log_controller_1 = require("../log/rh-log.controller");
const realtime_module_1 = require("../../commerce/realtime/realtime.module");
let SalaireModule = class SalaireModule {
};
exports.SalaireModule = SalaireModule;
exports.SalaireModule = SalaireModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule,
            prisma_module_1.PrismaModule,
            absence_module_1.AbsenceModule,
            pdf_generator_module_1.PdfGeneratorModule,
            entreprise_module_1.EntrepriseModule,
            realtime_module_1.RealtimeModule,
        ],
        controllers: [salaire_controller_1.SalaireController, rh_log_controller_1.RhLogController],
        providers: [salaire_service_1.SalaireService, rh_log_service_1.RhLogService],
        exports: [
            salaire_service_1.SalaireService,
        ],
    })
], SalaireModule);
//# sourceMappingURL=salaire.module.js.map