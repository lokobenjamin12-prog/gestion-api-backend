// src/entreprise/entreprise.controller.ts
import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { EntrepriseService } from '../services/entreprise.service';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { CreateEntrepriseDto } from '../dto/create-entreprise.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UpdateEntrepriseDto } from '../dto/update-entreprise.dto';

// Nestjs Swagger decorators
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiResponse,
    ApiCookieAuth
} from '@nestjs/swagger';


// Dossier de stockage des logos
const LOGO_DIR = path.join(process.cwd(), 'storage', 'logos');

// Créer le dossier si absent
if (!fs.existsSync(LOGO_DIR)) {
    fs.mkdirSync(LOGO_DIR, { recursive: true });
}

@ApiTags('Configuration Entreprise') // Regroupement Swagger UI@ApiBearerAuth()
@ApiCookieAuth('access_token') // Unification avec la stratégie globale de cookies
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('entreprise')
export class EntrepriseController {
    constructor(private readonly entrepriseService: EntrepriseService) { }


    // ─── Configurer l'entreprise ──────────────────────────────────────────────
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions('entreprise:create')
    @ApiOperation({
        summary: 'Configurer les informations initiales de l\'entreprise',
        description: 'Cette opération doit être exécutée une seule fois au démarrage ou lors du setup initial. Le système lèvera une exception de conflit (409) si une configuration entreprise existe déjà.',
    })
    @ApiResponse({ status: 201, description: 'Entreprise initialisée et configurée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'entreprise:create\' requis).' })
    @ApiResponse({ status: 409, description: 'L\'entreprise a déjà été configurée sur cette instance.' })

    create(@Body() dto: CreateEntrepriseDto, @GetUser('sub') actorId: string) {
        return this.entrepriseService.create(dto, actorId);
    }

    // ─── Consulter l'entreprise ───────────────────────────────────────────────
    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('entreprise:read')
    @ApiOperation({
        summary: 'Obtenir les informations de l\'entreprise',
        description: 'Retourne l\'ensemble de l\'identité de la structure (Nom, NUI/Régistre de commerce, contact, adresse, logo) pour affichage global ou sur les entêtes de documents.'
    })
    @ApiResponse({ status: 200, description: 'Données de l\'entreprise récupérées avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    get() {
        return this.entrepriseService.get();
    }

    // ─── Modifier les informations ────────────────────────────────────────────
    @Patch()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('entreprise:update')
    @ApiOperation({
        summary: 'Modifier les informations de l\'entreprise',
        description: 'Permet une mise à jour partielle (PATCH). Seuls les champs envoyés dans le corps de la requête seront altérés.',
    })
    @ApiResponse({ status: 200, description: 'Informations de l\'entreprise mises à jour avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    update(@Body() dto: UpdateEntrepriseDto, @GetUser('sub') actorId: string) {
        return this.entrepriseService.update(dto, actorId);
    }

    // ─── Uploader le logo ─────────────────────────────────────────────────────
    @Post('logo')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('enteprrise:update')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Fichier image du logo de l\'entreprise (Formats acceptés : JPG, JPEG, PNG. Poids max : 2 Mo)',
        schema: {
            type: 'object',
            properties: {
                logo: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({
        summary: 'Uploader et remplacer le logo de l\'entreprise',
        description: 'Prend en charge le téléversement de fichiers multimédias. Si un ancien logo existe sur le stockage, il sera automatiquement supprimé physiquement pour éviter l\'accumulation de fichiers orphelins.',
    })
    @ApiResponse({ status: 200, description: 'Logo téléversé et mis à jour avec succès.' })
    @ApiResponse({ status: 400, description: 'Fichier absent, format invalide ou taille supérieure à 2 Mo.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @UseInterceptors(
        FileInterceptor('logo', {
            storage: diskStorage({
                destination: LOGO_DIR,
                filename: (_req, file, cb) => {
                    const ext = path.extname(file.originalname).toLowerCase();
                    const filename = `logo_entreprise_${Date.now()}${ext}`;
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
    async uploadLogo(
        @UploadedFile() file: Express.Multer.File,
        @GetUser('sub') actorId: string,
    ) {
        if (!file) {
            throw new BadRequestException('Aucun fichier fourni');
        }
        console.log(file);

        return this.entrepriseService.updateLogo(
            { logo: file.path },
            actorId,
        );
    }
}
