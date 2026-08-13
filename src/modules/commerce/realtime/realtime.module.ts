import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WsAuthGuard } from 'src/modules/auth/authentification/guards/ws-auth.guard';
import { StockRealtimeGateway } from './stock-realtime.gateway';

@Module({
  imports: [JwtModule, PrismaModule],
  providers: [WsAuthGuard, StockRealtimeGateway],
  exports: [StockRealtimeGateway],
})
export class RealtimeModule {}
