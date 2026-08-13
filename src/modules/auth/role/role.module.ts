import { Module } from '@nestjs/common';
import { RoleController } from './controllers/controllers.controller';
import { RoleService } from './services/services.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthLogService } from '../log/auth-log.service';
import { AuthLogController } from '../log/auth-log.controller';
import { RealtimeModule } from 'src/modules/commerce/realtime/realtime.module';
// Importe aussi le LogModule si ton service utilise LogService

@Module({
  imports: [PrismaModule, JwtModule, RealtimeModule], // Indispensable pour injecter LogService
  controllers: [RoleController, AuthLogController],
  providers: [RoleService, AuthLogService],
  exports: [RoleService], // Optionnel : si tu veux utiliser RoleService dans d'autres modules
})
export class RoleModule { }
