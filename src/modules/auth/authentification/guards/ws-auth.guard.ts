import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from '../strategies/jwt.strategy';

// Rejoue la même vérification que AuthGuard (HTTP) : cookie httpOnly → signature/expiration JWT
// → hash bcrypt en base (User.accessToken). Un token révoqué (logout, désactivation) ne doit pas
// rester valide sur le canal WS alors qu'il l'est déjà pour l'HTTP.
@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    client.data.user = await this.authenticate(client);
    return true;
  }

  async authenticate(client: Socket): Promise<JwtPayload & { exp: number }> {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      throw new WsException("Aucun cookie fourni dans la requête.");
    }

    const accessToken = this.extractCookie(cookieHeader, 'access_token');
    if (!accessToken) {
      throw new WsException("Le cookie d'authentification 'access_token' est manquant.");
    }

    let payload: JwtPayload & { exp: number };
    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new WsException('Token invalide ou expiré.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { accessToken: true, active: true, status: true },
    });

    if (!user || !user.accessToken) {
      throw new WsException('Session invalide. Veuillez vous reconnecter.');
    }

    if (!user.active || user.status === AccountStatus.DEACTIVATED) {
      throw new WsException('Votre compte a été désactivé.');
    }

    const isTokenMatching = await bcrypt.compare(accessToken, user.accessToken);
    if (!isTokenMatching) {
      throw new WsException('Token révoqué ou invalide.');
    }

    return payload;
  }

  private extractCookie(cookieHeader: string, name: string): string | undefined {
    const match = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`));

    return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
  }
}
