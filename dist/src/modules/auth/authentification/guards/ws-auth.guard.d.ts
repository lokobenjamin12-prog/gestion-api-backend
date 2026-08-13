import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from '../strategies/jwt.strategy';
export declare class WsAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    authenticate(client: Socket): Promise<JwtPayload & {
        exp: number;
    }>;
    private extractCookie;
}
