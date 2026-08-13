import { PermissionService } from '../services/services.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreatePermissionDto } from '../dto/request/permission-create.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { PermissionFiltersDto } from '../dto/request/permission-filters.dto';
import { UpdatePermissionDto } from '../dto/request/permission-update.dto';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { Permission } from '@prisma/client';
import { PaginatedResponse } from '../dto/response/paginated-response';
import { PermissionWithCount } from '../dto/response/permission-with-count';

// 1. Importation des décorateurs de documentation et de configuration de Swagger
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(AuthGuard, PermissionsGuard) // 💡 Active la barrière JWT + Permissions pour tout le contrôleur
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions('permission:create')
    @ApiOperation({
        summary: 'Créer une nouvelle permission système',
        description: 'Le slug transmis dans le DTO sera nettoyé, débarrassé de ses espaces/tirets et forcé en MAJUSCULES (SNAKE_CASE).'
    })
    @ApiResponse({ status: 201, description: 'La permission a été créée avec succès et enregistrée dans l’audit.' })
    @ApiResponse({ status: 400, description: 'Le format des données envoyées est incorrect.' })
    @ApiResponse({ status: 401, description: 'Authentification requise (Token JWT manquant ou expiré).' })
    @ApiResponse({ status: 403, description: 'Accès interdit : Droits insuffisants.' })
    @ApiResponse({ status: 409, description: 'Un conflit est survenu : Cette permission technique existe déjà.' })
    async create(
        @Body() dto: CreatePermissionDto,
        @GetUser('sub') actorId: string, // Extrait l'ID de l'admin connecté depuis le Token Payload
    ): Promise<Permission> {
        // Appel du service optimisé avec passage automatique de l'acteur pour le log d'audit
        return await this.permissionService.create(dto, actorId);
    }



    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('permission:read')
    @ApiOperation({
        summary: 'Récupérer la liste paginée des permissions système',
        description: 'Permet de filtrer par recherche textuelle (sur le slug) et de gérer la pagination (page, limit).'
    })
    @ApiResponse({
        status: 200,
        description: 'Liste des permissions récupérée avec succès.',
        schema: {
            example: {
                data: [
                    { id: 1, slug: 'CREATE_USER', nom: 'Créer un utilisateur', _count: { roles: 2 } },
                    { id: 2, slug: 'UPDATE_STOCK', nom: 'Modifier le stock', _count: { roles: 1 } }
                ],
                meta: {
                    total: 2,
                    page: 1,
                    lastPage: 1,
                    limit: 50,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Authentification requise (JWT invalide).' })
    @ApiResponse({ status: 403, description: 'Privilèges insuffisants.' })
    async findAll(@Query() query: PermissionFiltersDto): Promise<PaginatedResponse<Permission>> {
        // On passe directement le DTO validé au service
        return await this.permissionService.findAll(query);
    }


    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('permission:read')
    @ApiOperation({
        summary: 'Consulter les détails d’une permission spécifique via son ID',
        description: 'Renvoie les informations de la permission ainsi que le nombre de rôles associés.'
    })
    @ApiResponse({ status: 200, description: 'Permission trouvée et retournée.' })
    @ApiResponse({ status: 400, description: 'L’identifiant fourni est invalide (doit être un entier supérieur à 0).' })
    @ApiResponse({ status: 401, description: 'Authentification JWT manquante ou expirée.' })
    @ApiResponse({ status: 403, description: 'Accès interdit pour ce rôle.' })
    @ApiResponse({ status: 404, description: 'La permission recherchée n’existe pas.' })
    async findOne(@Param('id') id: number): Promise<PermissionWithCount> {
        // Le contrôleur délègue la validation métier (id <= 0) et la requête Prisma au service
        return await this.permissionService.findOne(id);
    }


    @Get('slug/:slug')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('permission:read')
    @ApiOperation({
        summary: 'Trouver une permission par son slug technique',
        description: 'Permet de récupérer les détails d’un droit via son identifiant textuel (ex: CREATE_USER).'
    })
    @ApiResponse({ status: 200, description: 'Permission trouvée et retournée avec son décompte d’utilisation.' })
    @ApiResponse({ status: 400, description: 'Le slug fourni est vide ou mal formaté.' })
    @ApiResponse({ status: 401, description: 'Authentification requise.' })
    @ApiResponse({ status: 403, description: 'Droits d’accès insuffisants.' })
    @ApiResponse({ status: 404, description: 'Aucune permission ne correspond à ce slug dans le système.' })
    async findBySlug(@Param('slug') slug: string): Promise<PermissionWithCount> {
        // Le contrôleur transmet la chaîne brute au service qui se chargera du nettoyage (.trim().toUpperCase())
        return await this.permissionService.findBySlug(slug);
    }


    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('permission:update')
    @ApiOperation({
        summary: 'Modifier une permission système via son ID',
        description: 'Permet de mettre à jour le slug (qui sera nettoyé et normalisé) ou la description. L’action est journalisée dans l’audit.'
    })
    @ApiResponse({ status: 200, description: 'La permission a été mise à jour avec succès.' })
    @ApiResponse({ status: 400, description: 'L’ID ou les données fournies dans le DTO sont invalides.' })
    @ApiResponse({ status: 401, description: 'Authentification requise.' })
    @ApiResponse({ status: 403, description: 'Accès interdit : Droits insuffisants.' })
    @ApiResponse({ status: 404, description: 'La permission avec cet ID n’existe pas.' })
    @ApiResponse({ status: 409, description: 'Conflit : Le nouveau slug proposé est déjà utilisé par une autre permission.' })
    async update(
        @Param('id') id: number,
        @Body() dto: UpdatePermissionDto,
        @GetUser('sub') actorId: string,
    ): Promise<PermissionWithCount> {
        return await this.permissionService.update(id, dto, actorId);
    }


    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('permission:delete')
    @ApiOperation({
        summary: 'Supprimer définitivement une permission système via son ID',
        description: 'Détache automatiquement la permission de tous les rôles associés (table pivot) avant de l’effacer définitivement de la base de données. L’action est consignée dans l’audit.'
    })
    @ApiResponse({ status: 200, description: 'La permission a été déliée et supprimée avec succès.' })
    @ApiResponse({ status: 400, description: 'L’identifiant fourni est invalide.' })
    @ApiResponse({ status: 401, description: 'Authentification requise.' })
    @ApiResponse({ status: 403, description: 'Accès interdit : Privilèges insuffisants.' })
    @ApiResponse({ status: 404, description: 'La permission avec cet ID n’existe pas dans le système.' })
    async remove(
        @Param('id') id: number,
        @GetUser('sub') actorId: string, // Récupère l'ID du Super Admin pour le log d'audit transactionnel
    ): Promise<Permission> {
        // Le contrôleur délègue la déliaison de la table pivot et la suppression finale au service
        return await this.permissionService.remove(id, actorId);
    }

}