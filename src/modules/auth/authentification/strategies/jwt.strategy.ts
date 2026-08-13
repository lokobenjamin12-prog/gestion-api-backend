import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AccountStatus } from '@prisma/client';

//NB: sub = id de l'utilisateur
// Le payload signé (cf. AuthentificationService.generateTokens) contient { sub, email, nomrole } —
// pas `role`, qui n'a jamais été émis dans le token malgré l'ancien typage.
export interface JwtPayload {
  sub: string;
  email: string;
  nomrole: string;
}

// Ce code va me permettre de vérifié que le access Token envoyé par la requete est valide et que l'utilisateur existe , il  mettra le user trouvé dans la requete (req.user) Enfin qque je puisse l'utiliser dans les autres controllers.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        status: true,
        verified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token invalide ou utilisateur introuvable');
    }

    if (!user.active) {
      throw new UnauthorizedException('Compte désactivé');
    }

    if (user.status === AccountStatus.DEACTIVATED) {
      throw new UnauthorizedException('Compte désactivé');
    }

    return user;
  }
}
