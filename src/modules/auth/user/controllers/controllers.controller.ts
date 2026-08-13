import {
    Controller,
    Post,
    Body,
    Req,
    HttpStatus,
    HttpCode,
    Param,
    NotFoundException,
    Patch,
    ParseIntPipe,
    UseGuards,
    UploadedFile,
    BadRequestException,
    UseInterceptors
} from '@nestjs/common';

import { UserService } from '../services/services.service';
import { CreateUserDto, UpdateUserDto } from '../dto/request/user.dto';
import { Query } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { UserFiltersDto } from '../dto/request/user-filters.dto';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { AuthModule, State } from '@prisma/client';
import { AuthLogService } from '../../log/auth-log.service';
import { RequireContratBoth } from 'src/common/decorators/require-contrat.decorator';
import { PaginatedUserResponseDto } from '../dto/response/user-response.dto';

// Importations des décorateurs Swagger
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiCookieAuth,
    ApiParam,
    ApiConsumes,
    ApiBody
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { path } from 'pdfkit';
import * as nodePath from 'path';
import * as fs from 'fs';

export const PROFILE_PICTURE_DIR = nodePath.join(process.cwd(), 'uploads', 'profile-pictures');
fs.mkdirSync(PROFILE_PICTURE_DIR, { recursive: true });



@ApiTags('Gestion des Utilisateurs') // Section dédiée dans l'interface Swagger UI
@ApiCookieAuth('access_token') // Authentification par session/cookie exigée sur tout le contrôleur
@UseGuards(AuthGuard, PermissionsGuard) // Application des barrières de sécurité
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authLog: AuthLogService
    ) { }
    @Get()
    @RequirePermissions('user:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Récupérer la liste des utilisateurs',
        description: 'Retourne une liste paginée avec filtres (recherche, rôle, archive).'
    })
    @ApiResponse({
        status: 200,
        description: 'Liste récupérée avec succès.',
        type: PaginatedUserResponseDto
    })
    @ApiResponse({ status: 401, description: 'Non authentifié (cookie absent ou expiré).' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'user:read\' requis).' })

    async findAll(
        @Query() filters: UserFiltersDto,
        @Req() req: any
    ): Promise<PaginatedUserResponseDto> {
        const actorId = req.user.sub;

        return this.userService.findAll(filters, actorId);
    }

    @Get(':id')
    @RequirePermissions('user:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Récupérer un utilisateur par son ID',
        description: 'Permet de voir les détails d’un employé. Les admins voient tout, les users voient leur propre profil.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de l\'utilisateur (UUID ou identifiant technique)', example: 'usr_abc123xyz' })
    @ApiResponse({ status: 200, description: 'Utilisateur trouvé.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })

    async findOne(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const actorId = req.user.sub;
        return await this.userService.findOne(id, actorId);
    }

    @Get('by-email/:email')
    @RequirePermissions('user:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Rechercher un utilisateur par email',
        description: 'Retourne les informations publiques d’un utilisateur via son adresse email.'
    })
    @ApiParam({ name: 'email', description: 'Adresse email professionnelle ou personnelle ciblée', example: 'heidi.dev@ndolecam.com' })
    @ApiResponse({ status: 200, description: 'Utilisateur trouvé.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Aucun utilisateur trouvé avec cet email.' })

    async findByEmail(
        @Param('email') email: string,
        @Req() req: any
    ) {
        const actorId = req.user.sub;

        // On appelle le service avec isAuth = false pour garantir que le mot de passe est masqué
        const user = await this.userService.findByEmail(email, false);

        if (!user) {
            throw new NotFoundException(`Aucun utilisateur trouvé avec l'email : ${email}`);
        }

        // Log de consultation
        this.authLog.log({
            actorId,
            module: AuthModule.USER,
            action: 'SEARCH_USER_BY_EMAIL',
            message: `Recherche de l'utilisateur par email : ${email}`,
            state: State.SUCCESS,
        }).catch(() => { });

        return user;
    }


    @Patch(':id')
    @RequirePermissions('user:update')
    @RequireContratBoth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Mettre à jour un utilisateur',
        description: 'Permet de modifier les informations d’un utilisateur. Les admins peuvent tout modifier, les utilisateurs uniquement leur propre profil.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant de l\'utilisateur à modifier', example: 'usr_abc123xyz' })
    @ApiResponse({ status: 200, description: 'Utilisateur mis à jour avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Interdit : Tentative de modification d’un autre compte sans droits admin.' })
    @ApiResponse({ status: 404, description: 'Utilisateur ou Rôle introuvable.' })

    async update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
        @Req() req: any
    ) {
        const actorId = req.user.sub;
        return await this.userService.update(id, dto, actorId);
    }

    @Patch('archive/:id')
    @RequirePermissions('user:archive')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Archiver un utilisateur',
        description: 'Effectue un archivage (soft-delete). Désactive le compte, réinitialise les tokens et bloque l’accès.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant de l\'utilisateur à archiver', example: 'usr_abc123xyz' })
    @ApiResponse({ status: 200, description: 'Utilisateur archivé avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Utilisateur introuvable.' })
    @ApiResponse({ status: 409, description: 'L’utilisateur est déjà archivé.' })


    async archive(
        @Param('id') id: string,
        @Req() req: any
    ) {
        // On récupère l'ID de l'admin qui effectue l'archivage pour l'audit log
        const actorId = req.user.sub;

        return await this.userService.archive(id, actorId);
    }


    @Patch(':id/restore')
    @RequirePermissions('user:restore')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Restaurer un utilisateur archivé',
        description: 'Réactive un compte précédemment archivé et lui redonne accès au système.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant de l\'utilisateur à restaurer', example: 'usr_abc123xyz' })
    @ApiResponse({ status: 200, description: 'Utilisateur restauré avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Utilisateur introuvable.' })
    @ApiResponse({ status: 409, description: 'L’utilisateur n’est pas archivé.' })

    async restore(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const actorId = req.user.sub;

        return await this.userService.restore(id, actorId);
    }


    @Get(':id/logs')
    @RequirePermissions('user:read_log')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consulter les logs d’un utilisateur',
        description: 'Retourne une liste paginée des actions d\'audit effectuées par un utilisateur.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant de l\'utilisateur ciblé par l\'historique', example: 'usr_abc123xyz' })
    @ApiResponse({ status: 200, description: 'Historique récupéré avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Utilisateur introuvable.' })

    async getUserLogs(
        @Param('id') id: string,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
        //@Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        //@Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    ) {
        // On passe les paramètres de pagination convertis en nombres
        return await this.userService.getUserLogs(id, page, limit);
    }





    @Post(':id/profile-picture')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('user:update')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Photo de profil de l\'utilisateur (Formats acceptés : JPG, JPEG, PNG. Poids max : 2 Mo)',
        schema: {
            type: 'object',
            properties: {
                profilePicture: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({
        summary: 'Téléverser et remplacer la photo de profil d\'un utilisateur',
        description: 'Si une ancienne photo existe sur le stockage, elle sera automatiquement supprimée physiquement pour éviter l\'accumulation de fichiers orphelins.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant de l\'utilisateur ciblé', example: 'usr_abc123xyz' })
    @ApiResponse({ status: 200, description: 'Photo de profil téléversée et mise à jour avec succès.' })
    @ApiResponse({ status: 400, description: 'Fichier absent, format invalide ou taille supérieure à 2 Mo.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Utilisateur introuvable.' })
    @UseInterceptors(
        FileInterceptor('profilePicture', {
            storage: diskStorage({
                destination: PROFILE_PICTURE_DIR,
                filename: (_req, file, cb) => {
                    const ext = nodePath.extname(file.originalname).toLowerCase();
                    const filename = `profile_${Date.now()}${ext}`;
                    cb(null, filename);
                },
            }),
            fileFilter: (_req, file, cb) => {
                const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!allowed.includes(file.mimetype)) {
                    return cb(
                        new BadRequestException('Seuls les formats JPG et PNG sont acceptés'),
                        false,
                    );
                }
                cb(null, true);
            },
            limits: {
                fileSize: 2 * 1024 * 1024, // 2 Mo max
            },
        }),
    )

    async uploadProfilePicture(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        if (!file) {
            throw new BadRequestException('Aucun fichier fourni');
        }
        const actorId = req.user.sub;
        // Chemin relatif (ex: "profile-pictures/profile_....png"), pas le chemin
        // absolu du disque — c'est ce que le frontend utilisera pour construire
        // l'URL publique via le préfixe statique /uploads/.
        const relativePath = nodePath
            .relative(nodePath.join(process.cwd(), 'uploads'), file.path)
            .split(nodePath.sep)
            .join('/');
        return this.userService.updateProfilePicture(id, relativePath, actorId);
    }




    // async uploadProfilePicture(
    //     @Param('id') id: string,
    //     @UploadedFile() file: Express.Multer.File,
    //     @Req() req: any,
    // ) {
    //     if (!file) {
    //         throw new BadRequestException('Aucun fichier fourni');
    //     }
    //     const actorId = req.user.sub;
    //     return this.userService.updateProfilePicture(id, file.path, actorId);
    // }

}