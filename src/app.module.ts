import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { AuthentificationModule } from './modules/auth/authentification/authentification.module';
import { PrismaModule } from './prisma/prisma.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuthGuard } from './modules/auth/authentification/guards/auth.guard';
import { StocksModule } from './modules/commerce/stocks/stocks.module';
import { SalesSessionModule } from './modules/commerce/sales-session/sales-session.module';
import { DepartmentModule } from './modules/rh/department/department.module';
import { RoleModule } from './modules/auth/role/role.module';
import { PermissionModule } from './modules/auth/permission/permission.module';
import { ContratController } from './modules/rh/contrat/controllers/contrat.controller';
import { ContratModule } from './modules/rh/contrat/contrat.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AbsenceModule } from './modules/rh/absence/absence.module';
import { SalaireModule } from './modules/rh/salaire/salaire.module';
import { RapportModule } from './modules/rh/rapport/rapport.module';
import { PdfGeneratorModule } from './modules/admin/pdf-generator/pdf-generator.module';
import { ExcelGeneratorModule } from './modules/admin/excel-generator/excel-generator.module';
import { EntrepriseModule } from './modules/commerce/entreprise/entreprise.module';
import { RetardModule } from './modules/rh/retard/retard.module';
import { RetardController } from './modules/rh/retard/controllers/retard.controller';
import { UserModule } from './modules/auth/user/user.module';
import { HealthModule } from './modules/admin/health/health.module';
import { ContratGuard } from './common/guards/contrat.guard';
import { LogModule } from './modules/log/log.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ScheduleModule.forRoot(),
    AuthentificationModule,
    StocksModule,
    SalesSessionModule,
    DepartmentModule,
    RoleModule,
    PermissionModule,
    ContratModule,
    AbsenceModule,
    SalaireModule,
    RapportModule,
    PdfGeneratorModule,
    ExcelGeneratorModule,
    EntrepriseModule,
    RetardModule,
    UserModule, 
    HealthModule,  
    LogModule      
  ],
  
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ContratGuard }
  ],
  controllers: [ContratController, RetardController],
})

export class AppModule { }

