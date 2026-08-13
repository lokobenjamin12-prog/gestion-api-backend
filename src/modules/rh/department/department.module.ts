import { Module } from '@nestjs/common';
import { DepartmentController } from './controllers/controllers.controller';
import { DepartmentService } from './services/services.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RhLogService } from '../log/rh-log.service';
import { RhLogController } from '../log/rh-log.controller';
import { RealtimeModule } from 'src/modules/commerce/realtime/realtime.module';


@Module({
  imports: [PrismaModule, JwtModule, RealtimeModule],
  controllers: [DepartmentController, RhLogController],
  providers: [DepartmentService, RhLogService],
  exports: [DepartmentService],
})
export class DepartmentModule { }
