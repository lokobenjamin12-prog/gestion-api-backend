import { Module } from '@nestjs/common';
import { ControllersController } from './controllers/controllers.controller';
import { ServicesService } from './services/services.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommerceLogService } from '../log/commerce-log.service';
import { CommerceLogController } from '../log/commerce-log.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    JwtModule,
    PrismaModule,
    RealtimeModule,
  ],
  controllers: [ControllersController, CommerceLogController],
  providers: [ServicesService, CommerceLogService],
  exports: [ServicesService],
})
export class SalesSessionModule { }
