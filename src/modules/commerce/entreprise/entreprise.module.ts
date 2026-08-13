import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { EntrepriseService } from './services/entreprise.service';
import { EntrepriseController } from './controllers/entreprise.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthentificationModule } from '../../auth/authentification/authentification.module';
import { JwtModule } from '@nestjs/jwt';
import { CommerceLogService } from '../log/commerce-log.service';
import { CommerceLogController } from '../log/commerce-log.controller';


@Module({
  imports: [
    PrismaModule,
    JwtModule,
    MulterModule.register(),
    AuthentificationModule,
  ],
  providers: [EntrepriseService, CommerceLogService],
  controllers: [EntrepriseController, CommerceLogController],
  exports: [EntrepriseService],
})
export class EntrepriseModule { }