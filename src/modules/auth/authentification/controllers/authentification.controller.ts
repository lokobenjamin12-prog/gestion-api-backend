import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthentificationService } from '../services/authentification.service';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, ResetPasswordDto, VerifyEmailDto } from '../dto';
import { Public } from '../decorators/Public.decoration';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResendVerificationEmailDto } from '../dto/request/resend-Verification-Email.dto';
import { RefreshTokenGuard } from '../guards/refreshToken.guard';
import { CreateUserDto } from '../../user/dto/request/user.dto';
import { RegisterResponse } from '../dto/response/register-response';
import { VerifyEmailControllerResponse } from '../dto/response/verify-email-controller-response';
import { ResendVerificationEmailResponse } from '../dto/response/resend-verification-email-response';
import { LoginControllerResponse } from '../dto/response/login-controller-response';
import { RefreshControllerResponse } from '../dto/response/refresh-controller-response';
import { ForgotPasswordResponse } from '../dto/response/forgot-password-response';
import { ResetPasswordResponse } from '../dto/response/reset-password-response';
import { LogoutResponse } from '../dto/response/logout-response';
import { GetMeResponse } from '../dto/response/get-me-response';

// 1. Importation des décorateurs Swagger nécessaires
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { ChangePasswordProfileDto } from '../dto/request/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PROFILE_PICTURE_DIR } from '../../user/controllers/controllers.controller';
import * as nodePath from 'path';


//import { Response } from 'express';

@Controller('auth')
export class AuthentificationController {
  constructor(private readonly authService: AuthentificationService) { }

  /**
   * POST /auth/register
   * Inscription d'un nouvel utilisateur
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, PermissionsGuard) // 💡 Active la barrière JWT + Permissions pour tout le contrôleur
  @RequirePermissions('authentification:create') // 💡 Exige la permission de création
  @ApiCookieAuth('access_token') // 2. Indique que cette action nécessite le cookie d'accès admin
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur (Admin/Manager)' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données de validation incorrectes.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

  async register(
    @Body() createUserDto: CreateUserDto,
    @GetUser('sub') actorId: string,

    @Req() req: any // Contient l'utilisateur connecté si l'inscription est faite par un admin
  ): Promise<RegisterResponse> {
    return await this.authService.register(createUserDto, actorId);
  }



  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier l\'adresse email d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Email vérifié et cookies de session générés.' })
  @ApiResponse({ status: 400, description: 'Token de vérification invalide ou expiré.' })

  async verifyEmail(
    @Query() dto: VerifyEmailDto, // Récupère tous les query params dans le DTO
    @Res({ passthrough: true }) response: Response
  ): Promise<VerifyEmailControllerResponse> {
    // 1. On attend la réponse du service
    const result = await this.authService.verifyEmail(dto);

    // 2. Configuration des options de cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    // 3. On injecte l'Access Token dans le cookie
    response.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours 
    });

    // 4. On injecte le Refresh Token dans le cookie
    response.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    // 5. On retourne uniquement les infos non-sensibles
    return {
      message: result.message,
      user: result.user
    };
  }


  @Public() // Accessible sans token
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Renvoyer l'email de vérification" })
  @ApiResponse({ status: 200, description: 'Nouveau lien envoyé avec succès.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  @ApiResponse({ status: 400, description: 'Email déjà vérifié.' })

  async resendVerificationEmail(
    @Body() emailDto: ResendVerificationEmailDto,
    @Req() req: any
  ): Promise<ResendVerificationEmailResponse> {
    return await this.authService.resendVerificationEmail(emailDto, req);
  }



  /** 
   * POST /auth/login     
   * Connexion avec email + mot de passe
   */
  @Public() // Autorise l'accès sans token JWT
  @Post('login')
  @HttpCode(HttpStatus.OK) // Par défaut Nest renvoie 201 pour un POST, on préfère 200 pour un login
  @ApiOperation({ summary: 'Connexion utilisateur et génération des tokens' })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie. Retourne les informations utilisateur et les tokens.'
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides ou compte non vérifié/désactivé.'
  })

  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginControllerResponse> {
    const result = await this.authService.login(loginDto);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    // Set access token in cookie
    response.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Set refresh token in cookie
    response.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: result.message,
      user: result.user,
    };
  }


  @Public()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiCookieAuth('refresh_token') // 3. Indique que cette route requiert spécifiquement le refresh token
  @ApiOperation({ summary: 'Renouveler l\'access_token à l\'aide du refresh_token stocké dans les cookies' })
  @ApiResponse({ status: 200, description: 'Tokens renouvelés avec succès.' })
  @ApiResponse({ status: 401, description: 'Cookies manquants ou invalides.' })

  async refresh(
    @Req() req: Request,
    //@Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshControllerResponse> {
    // Extract tokens from cookies
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];

    if (!accessToken) {
      throw new UnauthorizedException("Cookie 'access_token' manquant.");
    }

    if (!refreshToken) {
      throw new UnauthorizedException("Cookie 'refresh_token' manquant.");
    }

    const tokens = await this.authService.refreshToken(
      { refreshToken },
      accessToken,
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    // Overwrite old cookies with new tokens
    response.cookie('access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Session renouvelée avec succès.' };
  }

  /**
   * POST /auth/forgot-password
   * Demande de réinitialisation de mot de passe
   */
  @Public() // Accessible sans être connecté
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander un lien de réinitialisation de mot de passe' })
  @ApiResponse({
    status: 200,
    description: 'Réponse générique envoyée pour des raisons de sécurité.'
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }



  /** 
   * POST /auth/reset-password    
   * Réinitialisation du mot de passe via token
   */
  @Public() // Accessible par l'utilisateur via le lien reçu par mail
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec un token valide' })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès.'
  })
  @ApiResponse({
    status: 400,
    description: 'Token invalide, expiré, ou nouveau mot de passe identique à l’ancien.'
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordResponse> {
    return await this.authService.resetPassword(resetPasswordDto);
  }


  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token') // 4. Nécessite d'être connecté pour se déconnecter
  @ApiOperation({ summary: 'Déconnexion de l\'utilisateur et suppression des cookies' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie et cookies vidés.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })

  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LogoutResponse> {
    // On extrait l'ID utilisateur injecté par le Guard (JWT) dans la requête
    const userId = req.user.sub;

    await this.authService.logout(userId);

    // Clear both cookies from client
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return { message: 'Déconnexion réussie.' };
  }



  /**
   * GET /auth/me
   * Récupère le profil de l'utilisateur connecté
   */
  @ApiBearerAuth() // Nécessite un Access Token valide
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Récupérer les informations de l’utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré avec succès.'
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé en base.'
  })
  @ApiResponse({
    status: 401,
    description: 'Jeton d’accès invalide ou expiré.'
  })

  async getMe(@Req() req: any): Promise<GetMeResponse> {
    // On récupère l'ID depuis le payload du token (injecté par le Guard)
    const userId = req.user.sub;
    return await this.authService.getMe(userId);
  }


  @UseGuards(AuthGuard)
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Mettre à jour son propre profil' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  async updateMe(@Body() dto: UpdateProfileDto, @Req() req: any): Promise<GetMeResponse> {
    return await this.authService.updateProfile(req.user.sub, dto);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Changer son mot de passe (utilisateur connecté)' })
  @ApiResponse({ status: 200, description: 'Mot de passe changé avec succès.' })
  @ApiResponse({ status: 400, description: 'Mot de passe actuel incorrect ou nouveau mot de passe invalide.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  async changePassword(@Body() dto: ChangePasswordProfileDto, @Req() req: any): Promise<{ message: string }> {
    return await this.authService.changePassword(req.user.sub, dto);
  }





  @Post('me/profile-picture')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Photo de profil de l\'utilisateur connecté (Formats acceptés : JPG, JPEG, PNG. Poids max : 2 Mo)',
    schema: {
      type: 'object',
      properties: {
        profilePicture: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Téléverser sa propre photo de profil' })
  @ApiResponse({ status: 200, description: 'Photo de profil mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Fichier absent, format invalide ou taille supérieure à 2 Mo.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: PROFILE_PICTURE_DIR,
        filename: (_req, file, cb) => {
          const ext = nodePath.extname(file.originalname).toLowerCase();
          cb(null, `profile_${Date.now()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Seuls les formats JPG et PNG sont acceptés'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadMyProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    const userId = req.user.sub;
    const relativePath = nodePath
      .relative(nodePath.join(process.cwd(), 'uploads'), file.path)
      .split(nodePath.sep)
      .join('/');
    return this.authService.updateMyProfilePicture(userId, relativePath);
  }
}
