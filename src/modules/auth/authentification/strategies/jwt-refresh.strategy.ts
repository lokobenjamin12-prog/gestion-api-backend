import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';




@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      // ✅ Extract JWT from the httpOnly cookie
      jwtFromRequest: (req: Request) => {
        const token = req?.cookies?.['refresh_token'];
        if (!token) return null;
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    this.logger.log(`🛡️ --- JwtRefreshStrategy : VALIDATION ---`);

    // 1. Extract refreshToken from cookie
    const refreshToken = req?.cookies?.['refresh_token'];

    if (!refreshToken) {
      this.logger.log(`❌ ÉCHEC : Refresh token manquant dans le cookie.`);
      throw new UnauthorizedException('Refresh token manquant.');
    }

    // 2. Load user from DB with stored hashed refreshToken
    this.logger.log(`[2/5] 🔍 Recherche de l'utilisateur: ${payload.sub}`);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    // 3. Check user exists and has a stored refreshToken
    if (!user || !user.refreshToken) {
      this.logger.log(`❌ ÉCHEC : Utilisateur introuvable ou session invalide.`);
      throw new UnauthorizedException('Session invalide. Veuillez vous reconnecter.');
    }

    // 4. Check account is active
    if (!user.active || user.status === AccountStatus.DEACTIVATED) {
      this.logger.log(`🛑 ÉCHEC : Compte désactivé pour: ${user.email}`);
      throw new UnauthorizedException('Votre compte a été désactivé.');
    }

    // 5. Compare incoming refreshToken with stored hash
    this.logger.log(`[5/5] 🔐 Comparaison du refresh token avec le hash en base...`);
    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isRefreshTokenMatching) {
      this.logger.log(`❌ ÉCHEC : Refresh token révoqué ou invalide pour: ${user.email}`);
      throw new UnauthorizedException('Refresh token invalide ou révoqué.');
    }

    this.logger.log(`✅ Refresh token valide pour: ${user.email}`);

    const { password, emailToken, emailTokenExpires, ...safeUser } = user;
    return { ...safeUser, refreshToken };
  }
}




// @Injectable()
// export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
//   private readonly logger = new Logger(JwtRefreshStrategy.name);

//   constructor(
//     private readonly configService: ConfigService,
//     private readonly prisma: PrismaService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
//       ignoreExpiration: false,
//       secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
//       passReqToCallback: true,
//     });
//   }

//   async validate(req: Request, payload: any) {
//     this.logger.log(`🛡️ --- JwtRefreshStrategy : VALIDATION ---`);

//     // 1. Extract refreshToken from body
//     const refreshToken = req.body?.refreshToken;

//     if (!refreshToken) {
//       this.logger.log(`❌ ÉCHEC : Refresh token manquant dans le body.`);
//       throw new UnauthorizedException('Refresh token manquant.');
//     }

//     // 2. Load user from DB with stored hashed refreshToken
//     this.logger.log(`[2/5] 🔍 Recherche de l'utilisateur: ${payload.sub}`);
//     const user = await this.prisma.user.findUnique({
//       where: { id: payload.sub },
//       include: { role: true },
//     });

//     // 3. Check user exists and has a stored refreshToken
//     if (!user || !user.refreshToken) {
//       this.logger.log(`❌ ÉCHEC : Utilisateur introuvable ou session invalide.`);
//       throw new UnauthorizedException('Session invalide. Veuillez vous reconnecter.');
//     }

//     // 4. Check account is active
//     if (!user.active || user.status === AccountStatus.DEACTIVATED) {
//       this.logger.log(`🛑 ÉCHEC : Compte désactivé pour: ${user.email}`);
//       throw new UnauthorizedException('Votre compte a été désactivé.');
//     }

//     // 5. Compare incoming refreshToken with stored hash
//     this.logger.log(`[5/5] 🔐 Comparaison du refresh token avec le hash en base...`);
//     const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);

//     if (!isRefreshTokenMatching) {
//       this.logger.log(`❌ ÉCHEC : Refresh token révoqué ou invalide pour: ${user.email}`);
//       throw new UnauthorizedException('Refresh token invalide ou révoqué.');
//     }

//     this.logger.log(`✅ Refresh token valide pour: ${user.email}`);

//     // Return user + plain refreshToken (needed by service to rotate)
//     const { password, emailToken, emailTokenExpires, ...safeUser } = user;
//     return { ...safeUser, refreshToken };
//   }
// }





// //Ce code va me permettre de vérifié que le refresh Token envoyé par la requete est valide et que l'utilisateur existe Ainsi dans le controller je pourrai directement utiliser le refresh token pour generer un nouveau access token et refresh token
// @Injectable()
// export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly prisma: PrismaService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
//       ignoreExpiration: false,
//       secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
//       passReqToCallback: true,
//     });
//   }

//   async validate(req: Request, payload: any) {
//     const refreshToken = req.body?.refreshToken;

//     if (!refreshToken) {
//       throw new UnauthorizedException('Refresh token manquant');
//     }

//     const user = await this.prisma.user.findUnique({
//       where: { id: payload.sub },
//     });

//     if (!user || !user.active) {
//       throw new UnauthorizedException('Utilisateur introuvable ou désactivé');
//     }

//     return { ...user, refreshToken };
//   }
// }
