import { Module } from '@nestjs/common';
import { UserController } from './controllers/controllers.controller';
import { UserService } from './services/services.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from '../authentification/mail/mail.module';
import { AuthLogService } from '../log/auth-log.service';
import { AuthLogController } from '../log/auth-log.controller';
import { RealtimeModule } from 'src/modules/commerce/realtime/realtime.module';


@Module({
  imports: [PrismaModule, JwtModule, MailModule, RealtimeModule],
  controllers: [UserController, AuthLogController],
  providers: [UserService, AuthLogService],
  exports: [UserService],
})
export class UserModule { }
