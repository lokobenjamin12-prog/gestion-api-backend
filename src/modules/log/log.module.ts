import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { AuthLogService } from '../auth/log/auth-log.service';
import { CommerceLogService } from '../commerce/log/commerce-log.service';
import { RhLogService } from '../rh/log/rh-log.service';

@Module({
    imports: [PrismaModule],
    controllers: [LogController],
    providers: [LogService, AuthLogService, CommerceLogService, RhLogService],
})
export class LogModule { }
