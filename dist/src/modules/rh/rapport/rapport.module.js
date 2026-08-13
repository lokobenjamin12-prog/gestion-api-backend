"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapportModule = void 0;
const common_1 = require("@nestjs/common");
const rapport_controller_1 = require("./controllers/rapport.controller");
const rapport_service_1 = require("./services/rapport.service");
const prisma_module_1 = require("../../../prisma/prisma.module");
const excel_generator_module_1 = require("../../admin/excel-generator/excel-generator.module");
const pdf_generator_module_1 = require("../../admin/pdf-generator/pdf-generator.module");
const jwt_1 = require("@nestjs/jwt");
const entreprise_module_1 = require("../../commerce/entreprise/entreprise.module");
const rh_log_service_1 = require("../log/rh-log.service");
const rh_log_controller_1 = require("../log/rh-log.controller");
const realtime_module_1 = require("../../commerce/realtime/realtime.module");
let RapportModule = class RapportModule {
};
exports.RapportModule = RapportModule;
exports.RapportModule = RapportModule = __decorate([
    (0, common_1.Module)({
        imports: [pdf_generator_module_1.PdfGeneratorModule, excel_generator_module_1.ExcelGeneratorModule, prisma_module_1.PrismaModule, jwt_1.JwtModule, entreprise_module_1.EntrepriseModule, realtime_module_1.RealtimeModule],
        controllers: [rapport_controller_1.RapportController, rh_log_controller_1.RhLogController],
        providers: [rapport_service_1.RapportService, rh_log_service_1.RhLogService],
        exports: [rapport_service_1.RapportService]
    })
], RapportModule);
//# sourceMappingURL=rapport.module.js.map