import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AccountStatus, AuthModule, LogLevel, Reason, Role, State } from '@prisma/client';

import { PrismaService } from '../../../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ResendVerificationEmailDto } from '../dto/request/resend-Verification-Email.dto';
import { UserService } from '../../user/services/services.service';
import { CreateUserDto } from '../../user/dto/request/user.dto';
import { AuthLogService } from '../../log/auth-log.service';

import {
  RegisterResponse,
  ResendVerificationEmailResponse,
  VerifyEmailResponse,
  LoginResponse,
  RefreshTokenResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  LogoutResponse,
  GetMeResponse,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  VerifyEmailDto,
  getMeSelect
} from '../dto/index';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { ChangePasswordProfileDto } from '../dto/request/change-password.dto';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';

const SALT_ROUNDS = 12;
const EMAIL_TOKEN_EXPIRY_HOURS = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const AUTH_MODULE = AuthModule.AUTH; // ← replaces the string constant


@Injectable()
export class AuthentificationService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private userService: UserService,
    private authLog: AuthLogService,
    private readonly realtimeGateway: StockRealtimeGateway,
  ) { }
  private readonly logger = new Logger(AuthentificationService.name);

  // ─── Inscription ──────────────────────────────────────────────────────────
  async register(dto: CreateUserDto, actorId: string): Promise<RegisterResponse> {
    if (!actorId) {
      this.logger.warn(`Tentative de création bloquée : aucun administrateur connecté.`);
      throw new UnauthorizedException(
        "Action interdite. Vous devez être connecté pour créer un nouvel utilisateur."
      );
    }

    // 1. DATABASE TRANSACTION (Kept tight, fast, and I/O free)
    const user = await this.prisma.$transaction(async (tx) => {
      // Création de l'utilisateur (emailToken généré dans userService.create)
      return await this.userService.create(dto, actorId, tx);
    });

    // --- THE TRANSACTION IS CLOSED AND COMMITTED HERE ---

    // 2. Envoi de l'email de vérification (Safe from database timeouts!)
    try {
      if (user.emailToken) {
        await this.mailService.sendVerificationEmail(
          user.email,
          user.firstName,
          user.emailToken
        );
        this.logger.log(`📩 Email de vérification envoyé à : ${user.email}`);
      } else {
        this.logger.warn(`Utilisateur ${user.email} créé sans emailToken.`);
      }
    } catch (mailError) {
      this.logger.error(`Échec envoi mail à ${user.email}: ${mailError.message}`);

      // This won't impact user creation anymore because the transaction is already committed
      await this.authLog.error({
        actorId,
        actorName: await this.authLog.resolveActorName(actorId),
        module: AUTH_MODULE,
        action: 'REGISTER_MAIL_FAILED',
        email: user.email,
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Compte créé mais échec envoi mail de vérification à ${user.email}`,
      });
    }

    // 3. Log de succès global
    try {

      await this.authLog.info({
        actorId,
        actorName: await this.authLog.resolveActorName(actorId),
        module: AUTH_MODULE,
        action: 'REGISTER',
        entityId: user.id,
        entityName: user.email,
        email: user.email,
        apres: { email: user.email },
        message: `Nouvel utilisateur inscrit par ${actorId} : ${user.email}`,
      });

    } catch (logError) {
      this.logger.error(`Éche
        c enregistrement log de succès: ${logError.message}`);
    }

    // 4. Réponse propre
    return {
      message: 'Inscription réussie. Veuillez vérifier votre boîte mail.',
      user: this.sanitize(user),
    };
  }

  // ─── Vérification email ───────────────────────────────────────────────────

  async verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponse> {
    this.logger.log("📩 --- DÉBUT DE LA VÉRIFICATION D'EMAIL ---");

    // On cherche l'utilisateur (Lecture seule - pas besoin de try/catch spécifique ici)
    const user = await this.prisma.user.findFirst({
      where: { emailToken: dto.token },
    });

    if (!user) {
      this.logger.log("❌ ÉCHEC : Token invalide.");

      await this.authLog.warn({
        module: AUTH_MODULE,
        action: 'VERIFY_EMAIL',
        state: State.FAILED,
        reason: Reason.BAD_REQUEST,
        message: 'Token de vérification email invalide',
      });


      throw new BadRequestException('Token de vérification invalide');
    }

    // Vérification de l'expiration
    if (user.emailTokenExpires && user.emailTokenExpires < new Date()) {
      this.logger.log("⏰ ÉCHEC : Token expiré.");

      await this.authLog.warn({
        actorId: user.id,
        actorName: user.email,
        module: AUTH_MODULE,
        action: 'VERIFY_EMAIL',
        email: user.email,
        state: State.FAILED,
        reason: Reason.BAD_REQUEST,
        message: `Token expiré pour: ${user.email}`,
      });

      throw new BadRequestException('Le token a expiré. Veuillez en demander un nouveau.');
    }

    // --- ZONE CRITIQUE (Écritures en base de données) ---
    try {
      console.log("[3/6] 🛠️ Activation du compte dans Prisma...");
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          verified: true,
          status: AccountStatus.ACTIVE,
          emailToken: null,
          emailTokenExpires: null,
        },
        include: {
          role: true,
        },
      });

      console.log("[4/6] 🔑 Génération des tokens...");
      const tokens = await this.generateTokens(updatedUser.id.toString(), updatedUser.email, updatedUser.role.nomRole);

      console.log("[5/6] 💾 Stockage du Refresh Token...");
      // Note: Assure-toi que le nom est bien updateHashedRefreshToken si c'est celui qu'on a codé avant
      //await this.updateHashedRefreshToken(updatedUser.id.toString(), tokens.refreshToken);
      await this.setCurrentTokens(updatedUser.id.toString(), tokens.accessToken, tokens.refreshToken)

      console.log("[6/6] 📝 Log de succès...");

      await this.authLog.info({
        actorId: updatedUser.id,
        actorName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        module: AUTH_MODULE,
        action: 'VERIFY_EMAIL',
        entityId: updatedUser.id,
        entityName: updatedUser.email,
        email: updatedUser.email,
        message: `Email vérifié et utilisateur connecté: ${updatedUser.email}`,
      });

      this.logger.log(`✨ Succès total pour : ${updatedUser.email}`);
      this.logger.log("🏁 --- FIN DE LA VÉRIFICATION D'EMAIL ---");

      return {
        message: 'Email vérifié avec succès. Votre compte est maintenant actif.',
        ...tokens,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
        }
      };

    } catch (error) {
      console.error("💥 ERREUR CRITIQUE lors de la validation du compte :", error.message);

      // On logue l'erreur technique pour Hoozon SARL
      await this.authLog.critical({
        actorId: user.id,
        module: AUTH_MODULE,
        action: 'VERIFY_EMAIL_CRITICAL_ERROR',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Erreur système lors de la vérification de ${user.email}: ${error.message}`,
      });

      // On relance l'erreur pour que NestJS renvoie une 500 au client
      throw new InternalServerErrorException('Une erreur est survenue lors de l’activation de votre compte.');
    }
  }


  /**
 * Hache le refresh token et l'enregistre dans la base de données.
 * Cette méthode est utilisée lors du login, du register (après vérification) 
 * et lors de la rotation des tokens.
 */

  async setCurrentTokens(userId: string, accessToken: string, refreshToken: string): Promise<void> {
    this.logger.log(`🔑 --- DÉBUT : MISE À JOUR DU REFRESH TOKEN ---`);
    this.logger.log(`[1/3] ⚙️ Préparation du hachage pour l'utilisateur ID: ${userId}`);

    try {
      this.logger.log(`[2/3] 🔐 Génération du salt et hachage du refresh token...`);
      const refresh_salt = await bcrypt.genSalt();
      const hashedRefreshToken = await bcrypt.hash(refreshToken, refresh_salt);

      this.logger.log(`[2/4] 🔐 Hachage du access token...`);
      const access_salt = await bcrypt.genSalt();
      const hashedAccessToken = await bcrypt.hash(accessToken, access_salt);

      this.logger.log(`[3/3] 💾 Persistance du hash dans la base de données Prisma...`);
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          // Assure-toi que le nom du champ dans schema.prisma est bien 'refreshToken'
          refreshToken: hashedRefreshToken,
          accessToken: hashedAccessToken,
        },
      });

      this.logger.log(`✅ Success : Refresh Token et Access Token haché et enregistré avec succès.`);
      this.logger.log(`Hash du Refresh Token  et Access Token mis à jour pour l'utilisateur: ${userId}`);
      this.logger.log(`🏁 --- FIN : MISE À JOUR DU REFRESH TOKEN ET DE L'ACCESS TOKEN ---`);

    } catch (error) {
      this.logger.log(`❌ ERREUR CRITIQUE : Échec de l'enregistrement du Refresh Token et de l'Access Token !`);
      this.logger.error(
        `Erreur lors de l'enregistrement du Refresh Token et de l'Access Token pour ${userId}`,
        error.stack
      );

      await this.authLog.critical({
        actorId: userId,
        module: AUTH_MODULE,
        action: 'SET_CURRENT_TOKENS_FAILED',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Erreur lors de l'enregistrement des tokens pour ${userId}`,
      });

      throw error;
    }
  }


  // ─── Renvoi du mail de vérification ──────────────────────────────────────
  async resendVerificationEmail(emailDto: ResendVerificationEmailDto, req: any): Promise<ResendVerificationEmailResponse> {
    this.logger.log("🔄 --- DÉBUT : RENVOI DE L'EMAIL DE VÉRIFICATION ---");

    // 1. Recherche de l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email: emailDto.email.toLowerCase() },
    });

    if (!user) {
      this.logger.log("❌ ÉCHEC : Utilisateur non trouvé.");


      await this.authLog.warn({
        module: AUTH_MODULE,
        action: 'RESEND_VERIFICATION_FAILED',
        email: emailDto.email,
        state: State.FAILED,
        reason: Reason.NOT_FOUND,
        message: `Tentative de renvoi pour un email inexistant: ${emailDto.email}`,
      });

      throw new NotFoundException("Utilisateur non trouvé. Veillez vérifier si votre email est correct!");
    }

    // 2. Vérification du statut
    if (user.verified) {
      this.logger.log("⚠️ ÉCHEC : Déjà vérifié.");


      await this.authLog.info({
        actorId: user.id,
        module: AUTH_MODULE,
        action: 'RESEND_VERIFICATION_SKIPPED',
        email: user.email,
        state: State.FAILED,
        reason: Reason.BAD_REQUEST,
        message: `Tentative de renvoi pour un compte déjà vérifié: ${user.email}`,
      });


      throw new BadRequestException('Cet email est déjà vérifié!');
    }

    // 3. Préparation du nouveau token
    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailTokenExpires = new Date(
      Date.now() + EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    try {
      // 4. Mise à jour Prisma
      this.logger.log("[4/6] 💾 Mise à jour du token dans Prisma...");
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailToken, emailTokenExpires },
      });

      // 5. Envoi de l'email (Isolé pour ne pas bloquer le reste si besoin)
      this.logger.log(`[5/6] 📧 Tentative d'envoi à : ${user.email}`);
      try {
        await this.mailService.sendVerificationEmail(user.email, user.firstName, emailToken);
        this.logger.log("📩 Email expédié avec succès.");
      } catch (mailError) {
        this.logger.error("💥 ERREUR EMAIL : Le token est mis à jour mais l'envoi a échoué.");


        await this.authLog.error({
          actorId: user.id,
          module: AUTH_MODULE,
          action: 'RESEND_VERIFICATION_MAIL_FAILED',
          email: user.email,
          state: State.FAILED,
          reason: Reason.INTERNAL_SERVER_ERROR,
          message: `Échec de l'envoi du mail de renvoi à ${user.email}`,
        });

        throw new InternalServerErrorException("Erreur lors de l'envoi de l'email. Veuillez réessayer dans quelques instants.");
      }

      // 6. Log de succès
      await this.authLog.info({
        actorId: user.id,
        module: AUTH_MODULE,
        action: 'RESEND_VERIFICATION',
        email: user.email,
        message: `Renvoi du mail de vérification réussi : ${user.email}`,
      });

      return { message: 'Un nouveau lien de vérification a été envoyé.' };

    } catch (error) {
      this.logger.log("❌ ERREUR lors du processus de renvoi.");
      // Si c'est notre erreur de mail personnalisée, on la relance telle quelle
      if (error instanceof InternalServerErrorException) throw error;
      // Log d'erreur critique pour les crashs imprévus (ex: Prisma)

      await this.authLog.critical({
        actorId: user?.id,
        module: AUTH_MODULE,
        action: 'RESEND_VERIFICATION_CRASH',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Crash technique lors du renvoi pour ${emailDto.email} : ${error.message}`,
      });

      // Sinon, erreur générique Prisma ou autre
      throw new InternalServerErrorException("Une erreur technique est survenue.");
    }
  }

  // ─── Connexion ────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<LoginResponse> {
    this.logger.log("🔑 --- DÉBUT DU PROCESSUS DE CONNEXION ---");

    // 1. Recherche de l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      this.logger.log(`❌ ÉCHEC : Utilisateur non trouvé.`);

      await this.authLog.warn({
        module: AUTH_MODULE,
        action: 'LOGIN',
        email: dto.email,
        state: State.FAILED,
        reason: Reason.UNAUTHORIZED,
        message: `Tentative échouée : email "${dto.email}" non trouvé.`,
      });

      throw new UnauthorizedException('Identifiants invalides'); // Message générique pour la sécurité
    }

    // 2. Vérification mot de passe
    const isPasswordMatching = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatching) {
      this.logger.log("❌ ÉCHEC : Mot de passe incorrect.");
      await this.authLog.warn({
        module: AUTH_MODULE,
        action: 'LOGIN',
        email: dto.email,
        state: State.FAILED,
        reason: Reason.UNAUTHORIZED,
        message: `Mot de passe incorrect pour l'email: ${dto.email}`,
      });
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 3. Vérification de la validation de l'email
    if (!user.verified) {
      this.logger.log("⚠️ ÉCHEC : Email non vérifié.");
      await this.authLog.warn({
        actorId: user.id,
        module: AUTH_MODULE,
        action: 'LOGIN',
        email: user.email,
        state: State.FAILED,
        reason: Reason.UNAUTHORIZED,
        message: `Connexion refusée - email non vérifié: ${user.email}`,
      });
      throw new UnauthorizedException('Vous ne nous avez pas encore certifié que cette email est bien la votre. Veuillez consulter votre boite mail pour la vérification .');
    }

    // 4. Vérification du statut du compte
    if (!user.active || user.status === AccountStatus.DEACTIVATED) {
      this.logger.log("🛑 ÉCHEC : Compte inactif.");
      await this.authLog.warn({
        actorId: user.id,
        module: AUTH_MODULE,
        action: 'LOGIN',
        email: user.email,
        state: State.FAILED,
        reason: Reason.FORBIDDEN,
        message: `Connexion refusée - compte désactivé: ${user.email}`,
      });
      throw new UnauthorizedException('Votre compte a été désactivé.');
    }

    // --- ZONE CRITIQUE (Génération et Stockage) ---
    try {
      this.logger.log("[5/7] 🎟️ Génération des tokens JWT...");
      const tokens = await this.generateTokens(user.id.toString(), user.email, user.role.nomRole);

      this.logger.log("[6/7] 💾 Mise à jour du Refresh Token et de l'Access Token...");
      await this.setCurrentTokens(user.id.toString(), tokens.accessToken, tokens.refreshToken);

      this.logger.log("[7/7] 📝 Log de succès final...");

      await this.authLog.info({
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        module: AUTH_MODULE,
        action: 'LOGIN',
        email: user.email,
        entityId: user.id,
        message: `Connexion réussie: ${user.email}`,
      });

      const { password: _, emailToken, emailTokenExpires, ...safeUser } = user;

      this.logger.log(`✅ Connexion validée pour : ${user.email}`);
      return {
        message: 'Connexion réussie.',
        user: safeUser,
        ...tokens,
      };

    } catch (error) {
      this.logger.error("💥 ERREUR SYSTÈME lors du login :", error.message);

      await this.authLog.critical({
        actorId: user.id,
        module: AUTH_MODULE,
        action: 'LOGIN_SYSTEM_ERROR',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Erreur critique lors de la finalisation du login pour ${user.email}`,
      });

      throw new InternalServerErrorException('Une erreur技术 est survenue lors de la connexion.');
    }
  }



  // ─── Refresh token ────────────────────────────────────────────────────────

  async refreshToken(dto: RefreshTokenDto, accessToken: string): Promise<RefreshTokenResponse> {
    this.logger.log("🔄 --- DÉBUT : ROTATION DU TOKEN (REFRESH) ---");

    try {
      // 1. Vérification technique du token (Signature & Expiration JWT)
      this.logger.log("[1/7] 📜 Vérification de la signature et de l'expiration du JWT...");
      let payload: any;
      try {
        payload = this.jwtService.verify(dto.refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
        this.logger.log(`✅ Token JWT techniquement valide. ID utilisateur extrait : ${payload.sub}`);
      } catch (jwtError) {
        this.logger.log(`❌ ÉCHEC : Le token est expiré ou mal signé. Message : ${jwtError.message}`);
        this.logger.warn(`Échec de vérification JWT: ${jwtError.message}`);

        await this.authLog.warn({
          module: AUTH_MODULE,
          action: 'REFRESH_TOKEN_INVALID',
          state: State.FAILED,
          reason: Reason.UNAUTHORIZED,
          message: `Échec technique du refresh token : ${jwtError.message}`,
        });

        throw new UnauthorizedException('Session expirée ou invalide');
      }

      // 2. Recherche de l'utilisateur
      this.logger.log(`[2/7] 🔍 Recherche de l'utilisateur ID: ${payload.sub}...`);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user) {
        this.logger.log("❌ ÉCHEC : Utilisateur introuvable en base.");
        throw new UnauthorizedException('Accès refusé');
      }

      // 3. Vérification de l'état du compte
      this.logger.log(`[3/7] 🛡️ Vérification du statut du compte pour : ${user.email}`);
      if (!user.active || user.status === AccountStatus.DEACTIVATED) {
        this.logger.log(`⚠️ ÉCHEC : Compte non actif (Statut actuel : ${user.status})`);

        await this.authLog.warn({
          actorId: user.id,
          module: AUTH_MODULE,
          action: 'REFRESH_TOKEN_INACTIVE',
          email: user.email,
          state: State.FAILED,
          reason: Reason.FORBIDDEN,
          message: `Tentative de refresh sur un compte non actif : ${user.email}`,
        });

        throw new UnauthorizedException('Votre compte n\'est pas actif');
      }

      // 4. Vérification de la présence des tokens hachés en base
      this.logger.log("[4/7] 🔐 Vérification de l'existence d'une session en base de données...");
      if (!user.refreshToken || !user.accessToken) {
        this.logger.log("⚠️ ÉCHEC : Aucun token stocké (utilisateur probablement déconnecté).");
        throw new UnauthorizedException('Session non reconnue. Veuillez vous reconnecter.');
      }

      // 5. Vérification que l'accessToken appartient bien à cet utilisateur
      this.logger.log("[5/7] 🔍 Vérification que l'accessToken appartient à cet utilisateur...");
      const isAccessTokenMatching = await bcrypt.compare(accessToken, user.accessToken);

      if (!isAccessTokenMatching) {
        this.logger.log("🚨 ALERTE SÉCURITÉ : L'accessToken ne correspond pas à cet utilisateur !");

        await this.authLog.critical({
          actorId: user.id,
          module: AUTH_MODULE,
          action: 'SECURITY_ALERT_ACCESS_TOKEN_MISMATCH',
          email: user.email,
          state: State.FAILED,
          reason: Reason.FORBIDDEN,
          message: `Alerte Sécurité : AccessToken ne correspond pas pour ${user.email}. Invalidation forcée.`,
        });

        // Invalidate both tokens immediately — possible session hijack
        await this.prisma.user.update({
          where: { id: user.id },
          data: { accessToken: null, refreshToken: null },
        });

        throw new UnauthorizedException('Action non autorisée');
      }

      // 6. Comparaison bcrypt du refreshToken (Détection de validité)
      this.logger.log("[6/7] ⚖️ Comparaison du refresh token fourni avec le hash stocké (Bcrypt)...");
      const isRefreshTokenMatching = await bcrypt.compare(dto.refreshToken, user.refreshToken);

      if (!isRefreshTokenMatching) {
        this.logger.log("🚨 ALERTE SÉCURITÉ : Le refresh token ne correspond pas au hash en base !");

        await this.authLog.critical({
          actorId: user.id,
          module: AUTH_MODULE,
          action: 'SECURITY_ALERT_REFRESH_MISMATCH',
          email: user.email,
          state: State.FAILED,
          reason: Reason.FORBIDDEN,
          message: `Alerte Sécurité : Refresh Token non correspondant pour ${user.email}. Invalidation forcée.`,
        });

        // Invalidate both tokens immediately — possible session hijack
        await this.prisma.user.update({
          where: { id: user.id },
          data: { accessToken: null, refreshToken: null },
        });

        throw new UnauthorizedException('Action non autorisée');
      }

      // 7. Rotation : Invalidation de l'ancien accessToken + Génération de la nouvelle paire
      this.logger.log("[7/7] 🌀 Rotation réussie ! Génération de la nouvelle paire de tokens...");

      // Wipe old accessToken immediately before generating new ones
      await this.prisma.user.update({
        where: { id: user.id },
        data: { accessToken: null },
      });

      const tokens = await this.generateTokens(
        user.id.toString(),
        user.email,
        user.role.nomRole,
      );

      this.logger.log("💾 Stockage de la nouvelle paire de tokens hachés...");
      await this.setCurrentTokens(user.id.toString(), tokens.accessToken, tokens.refreshToken);

      await this.authLog.info({
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        module: AUTH_MODULE,
        action: 'REFRESH_TOKEN_SUCCESS',
        email: user.email,
        message: `Session renouvelée avec succès pour : ${user.email}`,
      });

      this.logger.log(`✨ Session renouvelée avec succès pour : ${user.email}`);
      this.logger.log("🏁 --- FIN : ROTATION DU TOKEN (REFRESH) ---");

      return tokens;

    } catch (error) {
      console.log('================================================ ');
      console.log('Refresh Token ERROR : ', error);
      console.log('================================================ ');
      if (error instanceof UnauthorizedException) throw error;

      this.logger.error(`❌ Erreur système imprévue : ${error.message}`, error.stack);

      await this.authLog.critical({
        module: AUTH_MODULE,
        action: 'REFRESH_TOKEN_SYSTEM_ERROR',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Erreur système lors du refresh : ${error.message}`,
      });

      throw new InternalServerErrorException('Une erreur est survenue lors du renouvellement de la session');
    }
  }
  // ─── Mot de passe oublié ──────────────────────────────────────────────────

  // ─── updateHashedRefreshToken ─────────────────────────────────────────────
  async updateHashedRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(refreshToken, salt);
      await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hash } });
    } catch (error) {
      await this.authLog.critical({
        actorId: userId,
        module: AUTH_MODULE,
        action: 'UPDATE_HASH_REFRESH_FAILED',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Échec technique de la rotation du hash : ${error.message}`,
      });
      throw error;
    }
  }


  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    this.logger.log("🔑 --- DÉBUT : MOT DE PASSE OUBLIÉ ---");

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    const genericResponse = {
      message: 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.',
    };

    // Sécurité : On ne dit pas si l'email existe ou non
    if (!user || !user.active) {
      await this.authLog.warn({
        module: AUTH_MODULE,
        action: 'FORGOT_PASSWORD_ATTEMPT',
        email: dto.email,
        state: State.FAILED,
        reason: Reason.NOT_FOUND,
        message: `Demande de reset pour un email non reconnu ou inactif : ${dto.email}`,
      });

      return genericResponse;
    }

    // Préparation du token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    try {
      // 1. Mise à jour Prisma
      this.logger.log("[3/5] 💾 Stockage du token dans Prisma...");
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires,
        },
      });

      // 2. Envoi de l'email (Isolé)
      this.logger.log(`[4/5] 📧 Tentative d'envoi à : ${user.email}`);
      try {
        await this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
        this.logger.log("📩 Email envoyé avec succès.");
      } catch (mailError) {
        // Échec de l'email : On logue l'erreur interne, mais on ne fait pas planter le client
        this.logger.error("💥 ERREUR MAIL : Impossible d'envoyer le lien de reset.");
        await this.authLog.error({
          actorId: user.id,
          module: AUTH_MODULE,
          action: 'FORGOT_PASSWORD_MAIL_FAILED',
          email: user.email,
          state: State.FAILED,
          reason: Reason.INTERNAL_SERVER_ERROR,
          message: `Échec envoi mail reset à ${user.email}: ${mailError.message}`,
        });
        // Optionnel : On peut quand même renvoyer la genericResponse pour ne pas trahir l'existence du compte
        return genericResponse;
      }

      // 3. Log de succès
      await this.authLog.info({
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        module: AUTH_MODULE,
        action: 'FORGOT_PASSWORD',
        email: user.email,
        message: `Demande de reset réussie pour: ${user.email}`,
      });

      return genericResponse;

    } catch (error) {
      this.logger.log("❌ ERREUR CRITIQUE lors du forgotPassword.");
      // On logue l'erreur de base de données
      await this.authLog.critical({
        module: AUTH_MODULE,
        action: 'FORGOT_PASSWORD_ERROR',
        state: State.FAILED,
        message: `Erreur système pour l'email ${dto.email}: ${error.message}`,
      });
      // Même en cas de crash DB, on renvoie la réponse générique pour rester discret
      return genericResponse;
    }
  }
  // ─── Réinitialisation du mot de passe ────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResponse> {
    this.logger.log("🔄 --- DÉBUT : RÉINITIALISATION DU MOT DE PASSE ---");

    // 1. Recherche de l'utilisateur
    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: dto.token },
    });
    console.log("user", user);

    if (!user) {
      this.logger.log("❌ ÉCHEC : Token invalide.");
      await this.authLog.warn({
        module: AUTH_MODULE,
        action: 'RESET_PASSWORD',
        state: State.FAILED,
        reason: Reason.BAD_REQUEST,
        message: 'Token de réinitialisation inexistant',
      });
      throw new BadRequestException('Lien de réinitialisation invalide.');
    }

    // 2. Vérification de l'expiration
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      console.log("⏰ ÉCHEC : Token expiré.");
      await this.authLog.warn({
        actorId: user.id,
        module: AUTH_MODULE,
        action: 'RESET_PASSWORD',
        email: user.email,
        state: State.FAILED,
        reason: Reason.BAD_REQUEST,
        message: `Token de réinitialisation expiré pour: ${user.email}`,
      });
      throw new BadRequestException('Le lien a expiré. Veuillez refaire une demande.');
    }

    // 3. Vérification de l'ancien mot de passe
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      this.logger.log("⚠️ ÉCHEC : Nouveau mot de passe identique à l'ancien.");
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'actuel.');
    }

    try {
      // 4 & 5. Hachage et Mise à jour
      this.logger.log("[4/7] 🔐 Hachage et [5/7] 💾 Mise à jour Prisma...");
      const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      // 6. Envoi de l'email (Isolé : l'échec ici ne doit pas annuler le succès du reset)
      try {
        this.logger.log(`[6/7] 📧 Envoi de la confirmation à : ${user.email}`);
        await this.mailService.sendPasswordChangedEmail(user.email, user.firstName);
      } catch (mailError) {
        console.error("⚠️ ALERTE : Mot de passe changé, mais échec de l'envoi de l'email de confirmation.");
        // On logue l'erreur de mail mais on continue pour renvoyer le succès au client
        await this.authLog.error({
          actorId: user.id,
          module: AUTH_MODULE,
          action: 'RESET_PASSWORD_MAIL_FAILED',
          email: user.email,
          state: State.FAILED,
          reason: Reason.INTERNAL_SERVER_ERROR,
          message: `Mot de passe changé mais email non envoyé à ${user.email}`,
        });
      }

      // 7. Log de succès final
      await this.authLog.info({
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        module: AUTH_MODULE,
        action: 'RESET_PASSWORD',
        email: user.email,
        message: `Réinitialisation réussie pour : ${user.email}`,
      });

      this.logger.log(`✨ Mot de passe mis à jour pour : ${user.email}`);
      return { message: 'Votre mot de passe a été réinitialisé avec succès.' };

    } catch (error) {
      this.logger.error(`💥 ERREUR CRITIQUE lors du resetPassword : ${error.message}`);
      await this.authLog.critical({
        actorId: user.id,
        module: AUTH_MODULE,
        action: 'RESET_PASSWORD_CRASH',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Échec technique majeur lors de la réinitialisation de ${user.email} : ${error.message}`,
      });

      throw new InternalServerErrorException('Une erreur technique est survenue.');
    }
  }

  // ─── Logout ─────────────────────────────────────────────────────────────── 


  async logout(userId: string): Promise<LogoutResponse> {
    this.logger.log("🚪 --- DÉBUT DU PROCESSUS DE DÉCONNEXION ---");

    try {
      // 1. Invalidate both tokens in DB
      this.logger.log(`[1/2] 🔐 Invalidation des tokens pour l'ID : ${userId}`);
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          accessToken: null,  // ← guard will now block any further request
          refreshToken: null, // ← refresh rotation no longer possible
        },
      });

      // 2. Log success
      this.logger.log(`[2/2] 📝 Enregistrement du log de déconnexion...`);
      await this.authLog.info({
        actorId: userId,
        actorName: await this.authLog.resolveActorName(userId),
        module: AUTH_MODULE,
        action: 'LOGOUT',
        message: 'Utilisateur déconnecté avec succès. Tokens invalidés en base.',
      });

      this.logger.log(`✅ Déconnexion réussie pour : ${userId}`);
      this.logger.log("🏁 --- FIN DU PROCESSUS DE DÉCONNEXION ---");

      return { message: 'Déconnexion réussie.' };

    } catch (error) {
      this.logger.error(`❌ ERREUR lors de la déconnexion : ${error.message}`);

      await this.authLog.critical({
        actorId: userId,
        module: AUTH_MODULE,
        action: 'LOGOUT_FAILED',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Échec technique de l'invalidation de session : ${error.message}`,
      });
      throw new InternalServerErrorException('Une erreur est survenue lors de la déconnexion.');
    }
  }
  //================================================================================================
  //  ==================================== Profil courant ==========================================
  //================================================================================================


  async getMe(userId: string): Promise<GetMeResponse> {
    this.logger.log("👤 --- DÉBUT : RÉCUPÉRATION DU PROFIL (GET ME) ---");

    this.logger.log(`[1/2] 🔍 Recherche du profil en base pour l'ID : ${userId}`);

    try {

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: getMeSelect,
      });

      if (!user) {
        this.logger.warn(`❌ ÉCHEC : Utilisateur ID ${userId} introuvable alors qu'il est authentifié.`);

        // On logue cet incident car c'est anormal (ex: utilisateur supprimé entre-temps)
        await this.authLog.warn({
          actorId: userId,
          module: AUTH_MODULE,
          action: 'GET_ME_FAILED',
          state: State.FAILED,
          reason: Reason.NOT_FOUND,
          message: `Tentative de récupération de profil échouée : l'ID ${userId} n'existe plus en base.`,
        });

        throw new NotFoundException('Utilisateur introuvable');
      }

      this.logger.log(`✅ Succès : Profil de ${user.email} récupéré.`);
      this.logger.log("🏁 --- FIN : RÉCUPÉRATION DU PROFIL ---");

      return user;

    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`💥 ERREUR SYSTÈME lors du getMe : ${error.message}`);

      // Erreur critique (ex: base de données injoignable)
      await this.authLog.critical({
        actorId: userId,
        module: AUTH_MODULE,
        action: 'GET_ME_ERROR',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Erreur système lors de la récupération du profil : ${error.message}`,
      });


      throw new InternalServerErrorException('Une erreur est survenue lors de la récupération de votre profil.');
    }
  }

  // ─── Mise à jour du profil (utilisateur connecté) ──────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<GetMeResponse> {
    this.logger.log(`👤 --- DÉBUT : MISE À JOUR DU PROFIL (${userId}) ---`);

    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.firstName !== undefined && { firstName: dto.firstName }),
          ...(dto.lastName !== undefined && { lastName: dto.lastName }),
          ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
          ...(dto.whatsappNumber !== undefined && { whatsappNumber: dto.whatsappNumber }),
          ...(dto.adresse !== undefined && { adresse: dto.adresse }),
        },
        select: getMeSelect,
      });

      await this.authLog.info({
        actorId: userId,
        actorName: `${updated.firstName} ${updated.lastName}`,
        module: AUTH_MODULE,
        action: 'UPDATE_PROFILE',
        entityId: userId,
        entityName: updated.email,
        message: `Profil mis à jour par l'utilisateur lui-même : ${updated.email}`,
      });

      this.realtimeGateway.emitEntityChanged({ module: 'user', action: 'updated', id: userId });

      this.logger.log(`✅ Profil mis à jour pour : ${updated.email}`);
      return updated;

    } catch (error) {
      this.logger.error(`💥 ERREUR lors de la mise à jour du profil : ${error.message}`);

      await this.authLog.critical({
        actorId: userId,
        module: AUTH_MODULE,
        action: 'UPDATE_PROFILE_ERROR',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Erreur système lors de la mise à jour du profil : ${error.message}`,
      });

      throw new InternalServerErrorException('Une erreur est survenue lors de la mise à jour de votre profil.');
    }
  }

  // ─── Changement de mot de passe (utilisateur connecté) ─────────────────────
  async changePassword(userId: string, dto: ChangePasswordProfileDto): Promise<{ message: string }> {
    this.logger.log(`🔑 --- DÉBUT : CHANGEMENT DE MOT DE PASSE (${userId}) ---`);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      await this.authLog.warn({
        actorId: userId,
        module: AUTH_MODULE,
        action: 'CHANGE_PASSWORD',
        email: user.email,
        state: State.FAILED,
        reason: Reason.UNAUTHORIZED,
        message: `Mot de passe actuel incorrect lors d'une tentative de changement : ${user.email}`,
      });
      throw new BadRequestException('Mot de passe actuel incorrect.');
    }

    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'actuel.');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          // Invalide les sessions actives (comme lors d'un reset via email) —
          // l'utilisateur devra se reconnecter, y compris sur cet onglet.
          accessToken: null,
          refreshToken: null,
        },
      });

      try {
        await this.mailService.sendPasswordChangedEmail(user.email, user.firstName);
      } catch (mailError) {
        this.logger.error(`⚠️ Mot de passe changé mais échec de l'envoi de l'email de confirmation à ${user.email}.`);
      }

      await this.authLog.info({
        actorId: userId,
        actorName: `${user.firstName} ${user.lastName}`,
        module: AUTH_MODULE,
        action: 'CHANGE_PASSWORD',
        email: user.email,
        message: `Mot de passe changé par l'utilisateur lui-même : ${user.email}`,
      });

      this.logger.log(`✅ Mot de passe changé pour : ${user.email}`);
      return { message: 'Votre mot de passe a été changé avec succès. Veuillez vous reconnecter.' };

    } catch (error) {
      this.logger.error(`💥 ERREUR CRITIQUE lors du changement de mot de passe : ${error.message}`);

      await this.authLog.critical({
        actorId: userId,
        module: AUTH_MODULE,
        action: 'CHANGE_PASSWORD_CRASH',
        state: State.FAILED,
        reason: Reason.INTERNAL_SERVER_ERROR,
        message: `Échec technique du changement de mot de passe pour ${user.email} : ${error.message}`,
      });

      throw new InternalServerErrorException('Une erreur technique est survenue.');
    }
  }


  // ─── Photo de profil (utilisateur connecté) ─────────────────────────────────
  async updateMyProfilePicture(userId: string, relativePath: string) {
    const updated = await this.userService.updateProfilePicture(userId, relativePath, userId);
    return this.sanitize(updated);
  }

  // ─── Logs utilisateur ─────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, nomrole: string) {
    this.logger.log("🎟️ --- DÉBUT : GÉNÉRATION DES TOKENS JWT ---");

    // 1. Préparation du payload
    this.logger.log(`[1/3] 📝 Préparation du payload pour : ${email}`);
    const payload = { sub: userId, email, nomrole };

    try {
      // 2. Signature des tokens
      this.logger.log("[2/3] ✍️ Signature simultanée de l'Access Token et du Refresh Token...");

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<any>('JWT_EXPIRATION', '15m'),
        }),
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<any>('JWT_REFRESH_SECRET_EXPIRATION', '7d'),
        }),
      ]);

      this.logger.log("✅ Signature réussie. Les secrets JWT ont été appliqués.");

      // 3. Fin du processus
      this.logger.log(`[3/3] 📤 Pair de tokens prête pour l'ID : ${userId}`);
      this.logger.log("🏁 --- FIN : GÉNÉRATION DES TOKENS JWT ---");

      return { accessToken, refreshToken };

    } catch (error) {
      this.logger.log("💥 ERREUR CRITIQUE lors de la signature JWT !");
      this.logger.log(`🧐 Détails : Vérifiez vos clés secrètes dans le fichier .env`);
      throw error;
    }
  }

  private sanitize(user: any) {
    if (!user) return null;
    const { password, refreshToken, emailToken, ...safeUser } = user;
    return safeUser;
  }
}
