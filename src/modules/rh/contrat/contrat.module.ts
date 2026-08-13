import { Module } from '@nestjs/common';
import { ContratService } from './services/contrat.service';
import { ContratCron } from './contrat.cron';
import { ContratController } from './controllers/contrat.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { RhLogService } from '../log/rh-log.service';
import { RhLogController } from '../log/rh-log.controller';
import { RealtimeModule } from 'src/modules/commerce/realtime/realtime.module';

@Module({
  imports: [PrismaModule, JwtModule, RealtimeModule],
  controllers: [ContratController, RhLogController],
  providers: [ContratService, ContratCron, RhLogService],
  exports: [ContratService, ContratCron],
})
export class ContratModule { }
