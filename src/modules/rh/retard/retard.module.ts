import { Module } from '@nestjs/common';
import { RetardService } from './services/retard.service';
import { RetardController } from './controllers/retard.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { RhLogService } from '../log/rh-log.service';
import { RhLogController } from '../log/rh-log.controller';
import { RealtimeModule } from '../../commerce/realtime/realtime.module';

@Module({
  imports: [PrismaModule, JwtModule, RealtimeModule],
  controllers: [RetardController, RhLogController],
  providers: [RetardService, RhLogService],
  exports: [RetardService]
})
export class RetardModule { }