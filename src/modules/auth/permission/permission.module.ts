import { Module } from '@nestjs/common';
import { PermissionService } from './services/services.service';
import { PermissionController } from './controllers/controllers.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthLogService } from '../log/auth-log.service';
import { AuthLogController } from '../log/auth-log.controller';
import { RealtimeModule } from 'src/modules/commerce/realtime/realtime.module';

@Module({
  imports: [PrismaModule, JwtModule, RealtimeModule],
  controllers: [PermissionController, AuthLogController],
  providers: [PermissionService, AuthLogService],
  exports: [PermissionService]
})
export class PermissionModule { }