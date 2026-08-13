import { Module } from '@nestjs/common';
import { AuthentificationService } from './services/authentification.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AuthentificationController } from './controllers/authentification.controller';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { UserModule } from '../user/user.module';
import { AuthLogService } from '../log/auth-log.service';
import { AuthLogController } from '../log/auth-log.controller';
import { RealtimeModule } from '../../commerce/realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RealtimeModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, UserModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRATION');

        if (!secret || !expiresIn) {
          throw new Error('JWT_SECRET or JWT_EXPIRATION is not defined in .env');
        }

        return {
          secret: secret,
          signOptions: {
            // Le "as any" permet d'éviter l'erreur de type StringValue
            expiresIn: expiresIn as any,
          },
        };
      },
    }),
    MailModule,
    UserModule,
  ],
  controllers: [AuthentificationController, AuthLogController],
  providers: [AuthentificationService, JwtRefreshStrategy, JwtStrategy, RefreshTokenGuard, AuthLogService],
  exports: [AuthentificationService, JwtModule],
})
export class AuthentificationModule { }




