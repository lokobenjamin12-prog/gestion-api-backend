import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/Public.decoration';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // 2. Check cookie header exists
    if (!request.headers.cookie) {
      this.logger.log(`❌ ÉCHEC : Aucun cookie fourni dans la requête.`);
      throw new UnauthorizedException('Aucun cookie fourni dans la requête.');
    }

    // 3. Extract access_token from cookies
    const accessToken = request.cookies['access_token'];
    if (!accessToken) {
      this.logger.log(`❌ ÉCHEC : Cookie 'access_token' manquant.`);
      throw new UnauthorizedException("Le cookie d'authentification 'access_token' est manquant.");
    }

    // 4. Verify JWT signature + expiry
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      this.logger.log(`✅ Signature JWT valide pour: ${payload.email}`);

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        this.logger.log(`⏰ ÉCHEC : Access token expiré.`);
        throw new UnauthorizedException('Votre session a expiré. Veuillez rafraîchir votre token.');
      }
      if (error.name === 'JsonWebTokenError') {
        this.logger.log(`❌ ÉCHEC : Access token malformé ou invalide.`);
        throw new UnauthorizedException('Token invalide.');
      }
      if (error.name === 'NotBeforeError') {
        this.logger.log(`❌ ÉCHEC : Token utilisé avant sa date d'activation.`);
        throw new UnauthorizedException('Token non encore actif.');
      }
      throw new UnauthorizedException("Erreur d'authentification.");
    }

    // 5. Check token exists in DB → catches logout & rotation
    this.logger.log(`[5/5] 🔍 Vérification du token en base de données...`);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { accessToken: true, active: true, status: true },
    });

    // 6. User not found or no token stored (logged out)
    if (!user || !user.accessToken) {
      this.logger.log(`❌ ÉCHEC : Token introuvable en base — session expirée ou déconnexion détectée.`);
      throw new UnauthorizedException('Session invalide. Veuillez vous reconnecter.');
    }

    // 7. Account still active
    if (!user.active || user.status === AccountStatus.DEACTIVATED) {
      this.logger.log(`🛑 ÉCHEC : Compte désactivé.`);
      throw new UnauthorizedException('Votre compte a été désactivé.');
    }

    // 8. Compare incoming token with stored hash
    const isTokenMatching = await bcrypt.compare(accessToken, user.accessToken);

    if (!isTokenMatching) {
      this.logger.log(`🚨 ALERTE : Token ne correspond pas au hash en base — possible vol de session.`);
      throw new UnauthorizedException('Token révoqué ou invalide.');
    }

    this.logger.log(`✅ Token valide et actif en base pour: ${payload.email}`);
    request.user = payload;
    return true;
  }
}










// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private reflector: Reflector, private jwtService: JwtService, private configService: ConfigService) {
//   }

//   async canActivate(context: ExecutionContext) {
//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (isPublic) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest();
//     const authHeader = request.headers.cookie;

//     // 1. CAS : Absence totale de cookie
//     if (!authHeader) {
//       throw new BadRequestException("Aucun cookie fourni dans la requête");
//     }
//     const accessToken = request.cookies['access_token'];
//     if (!accessToken) {
//       throw new UnauthorizedException("Le cookie d'authentification 'access_token' est manquant");
//     }

//     // 2. CAS : Extraction et vérification du nom du cookie
//     // Note : Attention, request.headers.cookie est une chaîne.
//     // S'il y a plusieurs cookies, split('=') peut être imprécis.


//     /*
//     const cookie_name = authHeader.split('=')[0];
//     console.log("cookie_name", cookie_name);
//     if (cookie_name !== "access_token") {
//       throw new BadRequestException("Le cookie d'authentification est manquant ou mal nommé");
//     }
//     const token = authHeader.split('=')[1];
//    */

//     // 3. CAS : Nom présent mais valeur vide
//     if (!accessToken) {
//       throw new BadRequestException("La valeur du token est vide");
//     }

//     // 4. CAS : Vérification du Token (Authentification réelle)
//     try {
//       const payload = await this.jwtService.verifyAsync(accessToken, {
//         secret: this.configService.get<string>('JWT_SECRET')
//       });

//       console.log("payload", payload);
//       if (!payload) {
//         throw new BadRequestException("Token invalide ou expiré");
//       }
//       request.user = payload;
//     } catch (error) {
//       // On ne garde UnauthorizedException que pour l'échec de vérification du JWT
//       throw new UnauthorizedException("Token invalide ou expiré");
//     }

//     return true;
//   }
// }