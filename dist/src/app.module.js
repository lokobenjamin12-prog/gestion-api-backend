"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const authentification_module_1 = require("./modules/auth/authentification/authentification.module");
const prisma_module_1 = require("./prisma/prisma.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const auth_guard_1 = require("./modules/auth/authentification/guards/auth.guard");
const stocks_module_1 = require("./modules/commerce/stocks/stocks.module");
const sales_session_module_1 = require("./modules/commerce/sales-session/sales-session.module");
const department_module_1 = require("./modules/rh/department/department.module");
const role_module_1 = require("./modules/auth/role/role.module");
const permission_module_1 = require("./modules/auth/permission/permission.module");
const contrat_controller_1 = require("./modules/rh/contrat/controllers/contrat.controller");
const contrat_module_1 = require("./modules/rh/contrat/contrat.module");
const schedule_1 = require("@nestjs/schedule");
const absence_module_1 = require("./modules/rh/absence/absence.module");
const salaire_module_1 = require("./modules/rh/salaire/salaire.module");
const rapport_module_1 = require("./modules/rh/rapport/rapport.module");
const pdf_generator_module_1 = require("./modules/admin/pdf-generator/pdf-generator.module");
const excel_generator_module_1 = require("./modules/admin/excel-generator/excel-generator.module");
const entreprise_module_1 = require("./modules/commerce/entreprise/entreprise.module");
const retard_module_1 = require("./modules/rh/retard/retard.module");
const retard_controller_1 = require("./modules/rh/retard/controllers/retard.controller");
const user_module_1 = require("./modules/auth/user/user.module");
const health_module_1 = require("./modules/admin/health/health.module");
const contrat_guard_1 = require("./common/guards/contrat.guard");
const log_module_1 = require("./modules/log/log.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            schedule_1.ScheduleModule.forRoot(),
            authentification_module_1.AuthentificationModule,
            stocks_module_1.StocksModule,
            sales_session_module_1.SalesSessionModule,
            department_module_1.DepartmentModule,
            role_module_1.RoleModule,
            permission_module_1.PermissionModule,
            contrat_module_1.ContratModule,
            absence_module_1.AbsenceModule,
            salaire_module_1.SalaireModule,
            rapport_module_1.RapportModule,
            pdf_generator_module_1.PdfGeneratorModule,
            excel_generator_module_1.ExcelGeneratorModule,
            entreprise_module_1.EntrepriseModule,
            retard_module_1.RetardModule,
            user_module_1.UserModule,
            health_module_1.HealthModule,
            log_module_1.LogModule
        ],
        providers: [
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: response_interceptor_1.ResponseInterceptor },
            { provide: core_1.APP_GUARD, useClass: auth_guard_1.AuthGuard },
            { provide: core_1.APP_GUARD, useClass: contrat_guard_1.ContratGuard }
        ],
        controllers: [contrat_controller_1.ContratController, retard_controller_1.RetardController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map