import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Req,
    Query,
    Param,
    Patch,
    Put,
    Delete,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { RoleService } from '../services/services.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateRoleDto } from '../dto/request/role-create.dto';
import { RoleFiltersDto } from '../dto/request/role-filters.dto';
import { UpdateRoleDto } from '../dto/request/role-update.dto';
import { SyncPermissionsDto } from '../dto/request/role-sync-permissions.dto';
import { AddRemovePermissionsDto } from '../dto/request/role-addRemovePermissions.dto';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { RoleWithRelations } from '../dto/response/role-with-relations.dto';
import { PaginatedResponse } from '../../permission/dto/response/paginated-response';
import { Role } from '@prisma/client';

// Importation des décorateurs Swagger nécessaires
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags, ApiCookieAuth, ApiParam } from '@nestjs/swagger';


@ApiBearerAuth() // Indique que le JWT est requis
@Controller('roles')
@UseGuards(AuthGuard, PermissionsGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) { }

    @Post()
    @RequirePermissions('role:create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Créer un nouveau rôle avec permissions' })
    @ApiOperation({ summary: 'Créer un nouveau rôle avec permissions' })
    @ApiResponse({ status: 201, description: 'Le rôle a été créé avec succès.' })
    @ApiResponse({ status: 400, description: 'Données invalides ou permissions inexistantes.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'role:create\' requis).' })
    @ApiResponse({ status: 409, description: 'Conflit : ce rôle existe déjà.' })

    async create(
        @Body() createRoleDto: CreateRoleDto,
        @GetUser('sub') actorId: string
    ): Promise<RoleWithRelations> {
        return await this.roleService.create(createRoleDto, actorId);
    }


    @Get()
    @RequirePermissions('role:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Récupérer la liste des rôles avec pagination et filtres' })
    @ApiResponse({
        status: 200,
        description: 'Liste des rôles récupérée avec succès.',
        schema: {
            example: {
                data: [
                    { id: 1, nom: 'Ressources Humaines', description: 'Gestion globale des employés', code: 'RH', _count: { users: 5 } }
                ],
                meta: { total: 1, page: 1, lastPage: 1, limit: 20, hasNextPage: false, hasPreviousPage: false }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    async findAll(@Query() query: RoleFiltersDto): Promise<PaginatedResponse<RoleWithRelations>> {
        return await this.roleService.findAll(query);
    }




    @Get(':id')
    @RequirePermissions('role:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Récupérer un rôle spécifique par son ID',
        description: 'Retourne les détails du rôle incluant le département et les permissions associées.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant numérique unique du rôle', example: 1, type: Number })
    @ApiResponse({ status: 200, description: 'Détails du rôle récupérés avec succès.' })
    @ApiResponse({ status: 400, description: 'L’identifiant fourni est invalide (doit être un nombre).' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Le rôle demandé n’existe pas.' })

    async findOne(@Param('id') id: number): Promise<RoleWithRelations> {
        // Le ParseIntPipe transforme automatiquement "5" (string) en 5 (number)
        // Et renvoie une 400 si l'id n'est pas numérique (ex: "abc")
        return await this.roleService.findOne(id);
    }




    @Patch(':id')
    @RequirePermissions('role:update')
    @ApiOperation({ summary: 'Mettre à jour un rôle existant' })
    @ApiParam({ name: 'id', description: 'Identifiant numérique du rôle à modifier', example: 3, type: Number })
    @ApiResponse({ status: 200, description: 'Le rôle a été mis à jour avec succès.' })
    @ApiResponse({ status: 400, description: 'Données fournies incorrectes.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Rôle ou Département introuvable.' })
    @ApiResponse({ status: 409, description: 'Conflit : le nouveau nom de rôle généré existe déjà.' })

    async update(
        @Param('id') id: number,
        @Body() updateRoleDto: UpdateRoleDto,
        @GetUser('sub') actorId: string
    ): Promise<RoleWithRelations> {
        // On passe l'id (converti en number par le Pipe), le DTO et l'actorId extrait du JWT
        return await this.roleService.update(id, updateRoleDto, actorId);
    }





    // ─── PERMISSIONS : ADD (remplace tout) ─────────────────────────────

    @Put(':id/permissions/sync')
    @RequirePermissions('role:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Synchroniser (remplacer) les permissions d’un rôle',
        description: 'Supprime toutes les permissions actuelles et les remplace par la liste fournie.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant numérique du rôle concerné', example: 1, type: Number })
    @ApiResponse({ status: 200, description: 'Permissions synchronisées avec succès.' })
    @ApiResponse({ status: 400, description: 'ID invalide ou liste de permissions corrompue.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Le rôle spécifié n’existe pas.' })

    async syncPermissions(
        @Param('id') id: number,
        @Body() syncPermissionsDto: SyncPermissionsDto,
        @GetUser('sub') actorId: string,
    ): Promise<RoleWithRelations> {
        return await this.roleService.syncPermissions(id, syncPermissionsDto, actorId);
    }


    // ─── PERMISSIONS : ADD (ajoute sans écraser) ─────────────────────────────
    @Post(':id/permissions/add')
    @RequirePermissions('role:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Ajouter des permissions à un rôle',
        description: 'Ajoute une liste de permissions au rôle spécifié sans supprimer les permissions existantes.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant numérique du rôle ciblé', example: 2, type: Number })
    @ApiResponse({ status: 200, description: 'Permissions ajoutées avec succès.' })
    @ApiResponse({ status: 400, description: 'ID invalide ou certaines permissions n’existent pas.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Le rôle spécifié n’existe pas.' })
    async addPermissions(
        @Param('id') id: number,
        @Body() addPermissionsDto: AddRemovePermissionsDto,
        @GetUser('sub') actorId: string,
    ): Promise<RoleWithRelations> {
        return await this.roleService.addPermissions(id, addPermissionsDto, actorId);
    }


    @Post(':id/permissions/remove') // Utilisation de POST pour envoyer le tableau d'IDs
    @RequirePermissions('role:update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Retirer des permissions spécifiques d’un rôle',
        description: 'Supprime uniquement les relations entre le rôle et les permissions fournies dans le tableau.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant numérique du rôle à modifier', example: 1, type: Number })
    @ApiResponse({ status: 200, description: 'Permissions retirées avec succès.' })
    @ApiResponse({ status: 400, description: 'ID invalide ou requête mal formée.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Rôle introuvable.' })

    async removePermissions(
        @Param('id') id: number,
        @Body() removePermissionsDto: AddRemovePermissionsDto,
        @GetUser('sub') actorId: string,
    ): Promise<RoleWithRelations> {
        return await this.roleService.removePermissions(id, removePermissionsDto, actorId);
    }


    @Delete(':id')
    @RequirePermissions('role:delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Supprimer définitivement un rôle',
        description: 'La suppression échouera si le rôle est encore assigné à des utilisateurs (contrainte d’intégrité métier).'
    })
    @ApiParam({ name: 'id', description: 'Identifiant du rôle à détruire', example: 4, type: Number })
    @ApiResponse({ status: 200, description: 'Le rôle a été supprimé avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Le rôle demandé n’existe pas.' })
    @ApiResponse({ status: 409, description: 'Conflit : suppression impossible car des utilisateurs possèdent ce rôle.' })

    async remove(
        @Param('id') id: number,
        @GetUser('sub') actorId: string
    ): Promise<Role> {
        return await this.roleService.remove(id, actorId);
    }
}