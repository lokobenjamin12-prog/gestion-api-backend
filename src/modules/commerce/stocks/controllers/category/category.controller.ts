import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from '../../dto/request/create-category.dto';
import { CategoryService } from '../../services/category/category.service';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { GetCategoriesQueryDto } from '../../dto/request/get-categories-query.dto';
import { UpdateCategoryDto } from '../../dto/request/update-category.dto';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { RequireContratActor } from 'src/common/decorators/require-contrat.decorator';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Gestion des Catégories') // Regroupement propre dans l'UI Swagger
@ApiCookieAuth('access_token') // Stratégie d'authentification par cookies de Ndolecam
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('categories')

export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post('create')
    @RequirePermissions('category:create')
    @RequireContratActor()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Créer une nouvelle catégorie d\'articles',
        description: 'Crée une catégorie unique (ex: Boissons, Plats, Épices) pour regrouper et filtrer vos produits.',
    })
    @ApiResponse({ status: 201, description: 'Catégorie créée avec succès.' })
    @ApiResponse({ status: 400, description: 'Payload ou données fournies invalides.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'category:create\' requis).' })
    @ApiResponse({ status: 409, description: 'Conflit : Le nom de cette catégorie existe déjà.' })


    create(@Body() dto: CreateCategoryDto, @Req() req: any) {
        return this.categoryService.create(dto, req.user);
    }


    @Get('find-all')
    @RequirePermissions('category:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Récupérer la liste paginée et filtrée des catégories',
        description: 'Retourne l\'ensemble des catégories configurées selon les filtres de recherche fournis.',
    })
    @ApiResponse({ status: 200, description: 'Liste des catégories retournée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    findAll(@Query() query: GetCategoriesQueryDto, @Req() req: any) {
        return this.categoryService.findAll(query, req.user);
    }

    @Get('find-one/:id')
    @RequirePermissions('category:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consulter une catégorie par son identifiant',
        description: 'Retourne les métadonnées d\'une catégorie spécifique.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique (UUID/CUID) de la catégorie.', example: 'cat_abc123' })
    @ApiResponse({ status: 200, description: 'Catégorie trouvée et retournée.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Catégorie introuvable.' })

    async findOne(
        @Param('id') id: string,
        @Req() req: any
    ) {
        return this.categoryService.findOne(id, req.user);
    }

    @Patch('update/:id')
    @RequirePermissions('category:update')
    @RequireContratActor()
    @ApiOperation({
        summary: 'Modifier les informations d\'une catégorie',
        description: 'Permet de mettre à jour les propriétés modifiables (comme le nom ou la description) d\'une catégorie existante.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant de la catégorie à mettre à jour.', example: 'cat_abc123' })
    @ApiResponse({ status: 200, description: 'Catégorie mise à jour avec succès.' })
    @ApiResponse({ status: 400, description: 'Données de mise à jour invalides.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Catégorie introuvable.' })
    @ApiResponse({ status: 409, description: 'Le nouveau nom entré est déjà utilisé.' })

    @HttpCode(HttpStatus.OK)
    update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
        @Req() req: any
    ) {
        return this.categoryService.update(id, updateCategoryDto, req.user);
    }


    /**
    * Suppression logique(Soft Delete)
    * On utilise DELETE par convention REST, mais on fait un UPDATE en base.
    */
    @Patch('soft-delete/:id')
    @RequirePermissions('category:update')
    @RequireContratActor()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Désactiver temporairement une catégorie (Archivage logique)',
        description: 'Masque la catégorie dans l\'application en changeant son état en base, sans altérer physiquement l\'historique des données.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant de la catégorie à archiver.', example: 'cat_abc123' })
    @ApiResponse({ status: 200, description: 'Catégorie archivée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Catégorie introuvable.' })

    softRemove(@Param('id') id: string, @Req() req: any) {
        return this.categoryService.softDelete(id, req.user);
    }

    /**
   * Restauration d'une catégorie supprimée
   */
    @Patch('restore-category/:id')
    @RequirePermissions('category:update')
    @RequireContratActor()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Restaurer une catégorie archivée',
        description: 'Réactive une catégorie précédemment placée en soft-delete pour la réintégrer dans le catalogue actif.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant de la catégorie à restaurer.', example: 'cat_abc123' })
    @ApiResponse({ status: 200, description: 'Catégorie restaurée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Catégorie introuvable ou déjà active.' })

    async restore(@Param('id') id: string, @Req() req: any) {
        return this.categoryService.restore(id, req.user);
    }


    @Delete('delete/:id')
    @RequirePermissions('category:delete')
    @RequireContratActor()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Suppression physique définitive d\'une catégorie',
        description: '⚠️ Action définitive et irréversible. Supprime la ligne de catégorie de la base PostgreSQL.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de la catégorie à éliminer définitivement.', example: 'cat_abc123' })
    @ApiResponse({ status: 200, description: 'Catégorie définitivement purgée.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'category:delete\' requis).' })
    @ApiResponse({ status: 404, description: 'Catégorie introuvable.' })

    async remove(
        @Param('id') id: string,
        @Req() req: any
    ) {
        return this.categoryService.remove(id, req.user);
    }
}