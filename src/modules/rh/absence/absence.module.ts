import { Module } from '@nestjs/common';
import { AbsenceController } from './controllers/absence.controller';
import { AbsenceService } from './services/absence.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { RhLogService } from '../log/rh-log.service';
import { RhLogController } from '../log/rh-log.controller';
import { RealtimeModule } from 'src/modules/commerce/realtime/realtime.module';

@Module({
  imports: [PrismaModule, JwtModule, RealtimeModule],
  controllers: [AbsenceController, RhLogController],
  providers: [AbsenceService, RhLogService],
  exports: [AbsenceService],
})
export class AbsenceModule { }
