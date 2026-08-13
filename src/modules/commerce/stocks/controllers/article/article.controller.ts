// controllers/article.controller.ts
import {
    Body, Controller, Delete, Get,
    HttpCode,
    HttpStatus,
    Param, Patch, Post, Query, Req,
    UseGuards,
} from '@nestjs/common';
import { ArticleService } from '../../services/article/article.service';
import { CreateArticleDto } from '../../dto/request/create-article.dto';
import { UpdateArticleDto } from '../../dto/request/update-article.dto';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { GetArticlesQueryDto } from '../../dto/request/get-articles-query.dto';
import { CreateArticleResponseDto } from '../../dto/response/create-article-respons-dto';
import { ArticleDetailResponseDto } from '../../dto/response/article-detail-response.dto';
import { GetArticlesResponseDto } from '../../dto/response/get-articles-response.dto';
import { CreateSimpleArticleDto } from '../../dto/request/create-simple-article.dto';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCategoriesByArticleQueryDto } from '../../dto/request/get-categories-by-categoryId-query.dto';
import { RequireContratActor } from 'src/common/decorators/require-contrat.decorator';


@ApiTags('Gestion des Articles') // Regroupement clair dans Swagger UI
@ApiCookieAuth('access_token') // Utilisation de la stratégie d'authentification par cookie de Ndolecam
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('articles')

export class ArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @Post('simple-create-article')
    @RequirePermissions('article:create')
    @RequireContratActor()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Créer une référence article de base',
        description: 'Crée l\'entité Article brute sans stock ni catégorie initiale.',
    })
    @ApiResponse({ status: 201, description: 'Article de base créé avec succès.' })
    @ApiResponse({ status: 400, description: 'Données fournies invalides.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'article:create\' requis).' })
    @ApiResponse({ status: 409, description: 'Conflit : Le nom de l\'article existe déjà en base.' })

    async createSimple(
        @Body() dto: CreateSimpleArticleDto,
        @Req() req: any
    ) {
        const currentUser = req.user;

        return await this.articleService.createSimpleArticle(dto, currentUser);
    }

    @Post('create')
    @RequirePermissions('article:create')
    @RequireContratActor()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Créer un article avec sa catégorie et son stock initial',
        description: 'Crée l\'article et initialise ses relations de stock et de catégorie au cours d\'une même transaction.'
    })
    @ApiResponse({ status: 201, type: CreateArticleResponseDto, description: 'Article complet initialisé avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 409, description: 'Le nom de l\'article ou les références sont en conflit.' })


    async create(@Body() dto: CreateArticleDto, @Req() req: any): Promise<CreateArticleResponseDto> {
        return this.articleService.createArticleWithCategory(dto, req.user);
    }

    @Get('find-all')
    @RequirePermissions('article:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Récupérer la liste filtrée et paginée des articles',
        description: 'Retourne un catalogue d\'articles selon les filtres passés en query string.'
    })
    @ApiResponse({ status: 200, type: GetArticlesResponseDto, description: 'Catalogue d\'articles retourné avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    async findAll(@Query() query: GetArticlesQueryDto, @Req() req: any): Promise<GetArticlesResponseDto> {
        return await this.articleService.findAll(query, req.user);
    }

    @Get(':id/categories')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('article:read')
    @ApiOperation({
        summary: 'Obtenir les catégories paginées associées à un article',
        description: 'Retourne l\'ensemble des liaisons de catégories pour l\'article spécifié.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique (UUID/CUID) de l\'article ciblé.', example: 'art_123xyz' })
    @ApiResponse({ status: 200, description: 'Liste des catégories de l\'article récupérée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Article introuvable.' })

    getCategoriesByArticle(
        @Param('id') id: string,
        @Query() query: GetCategoriesByArticleQueryDto,
        @Req() req: any
    ) {
        return this.articleService.getCategoriesByArticle(id, query, req.user);
    }

    @Get('find-one/:id')
    @RequirePermissions('article:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consulter la fiche détaillée d\'un article',
        description: 'Retourne l\'intégralité des métadonnées d\'un article via son identifiant unique.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de l\'article.', example: 'art_123xyz' })
    @ApiResponse({ status: 200, type: ArticleDetailResponseDto, description: 'Détails de l\'article trouvés et retournés.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Article introuvable.' })

    async findOne(
        @Param('id') id: string,
        @Req() req: any
    ): Promise<ArticleDetailResponseDto> {
        return await this.articleService.findOne(id, req.user);
    }

    @Patch('update/:id')
    @RequirePermissions('article:update')
    @RequireContratActor()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Mettre à jour les informations d\'un article',
        description: 'Permet de modifier les caractéristiques de base (nom, prix, etc.) d\'une référence.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de l\'article à modifier.', example: 'art_123xyz' })
    @ApiResponse({ status: 200, description: 'Article mis à jour avec succès.' })
    @ApiResponse({ status: 400, description: 'Payload de modification invalide.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Article introuvable.' })

    async update(
        @Param('id') id: string,
        @Body() dto: UpdateArticleDto,
        @Req() req: any,
    ) {
        return await this.articleService.update(id, dto, req.user);
    }

    @Patch('soft-delete/:id')
    @RequirePermissions('article:update')
    @RequireContratActor()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Désactiver un article (Archivage logique)',
        description: 'Bascule l\'état de l\'article pour le masquer de l\'application sans le supprimer définitivement de la base PostgreSQL.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant de l\'article à archiver.', example: 'art_123xyz' })
    @ApiResponse({ status: 200, description: 'Article archivé avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Article introuvable.' })

    async softDeleteArticle(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.articleService.softDeleteArticle(id, req.user);
    }

    @Patch('restore/:id')
    @RequirePermissions('article:update')
    @RequireContratActor()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Restaurer un article archivé',
        description: 'Réactive un article précédemment placé en soft-delete pour le rendre de nouveau visible dans le catalogue actif.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant de l\'article à restaurer.', example: 'art_123xyz' })
    @ApiResponse({ status: 200, description: 'Article restauré avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Article introuvable ou déjà actif.' })

    async restoreArticle(
        @Param('id') id: string,
        @Req() req: any
    ) {
        return this.articleService.restoreArticle(id, req.user);
    }

    @Delete('physical-delete/:id')
    @RequirePermissions('article:delete')
    @RequireContratActor()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Suppression physique définitive de l\'article',
        description: '⚠️ Action irréversible. Supprime définitivement la ligne d\'article de la base de données.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de l\'article à détruire.', example: 'art_123xyz' })
    @ApiResponse({ status: 200, description: 'Article définitivement retiré de la base de données.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'article:delete\' requis).' })
    @ApiResponse({ status: 404, description: 'Article introuvable.' })
    async remove(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return await this.articleService.hardDeleteArticle(id, req.user);
    }
}
