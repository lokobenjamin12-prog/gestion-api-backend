import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator'; // Ton décorateur actuel (ou @CurrentUser)
import { DepartmentService } from '../services/services.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { DepartmentFiltersDto } from '../dto/department-filters.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';


@ApiTags('Départements & Structure RH')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Authentification requise : Token JWT manquant ou expiré.' })
@ApiResponse({ status: 403, description: 'Accès interdit : Permissions de département insuffisantes.' })
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('departments')

export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) { } // Ajuste selon le nom réel de ton service

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions('department:create')
    @ApiOperation({
        summary: 'Créer un nouveau département',
        description: 'Initialise un département. Le nom fourni sera automatiquement nettoyé (trim) et passé en majuscules sur le serveur.'
    })
    @ApiCreatedResponse({ description: 'Département créé avec succès.' })
    @ApiResponse({ status: 409, description: 'Conflit : Un département avec ce nom existe déjà.' })

    async create(
        @Body() dto: CreateDepartmentDto,
        @GetUser('sub') actorId: string
    ) {
        return await this.departmentService.create(dto, actorId);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('department:read')
    @ApiOperation({
        summary: 'Récupérer la liste des départements',
        description: 'Supporte la pagination, le tri et la recherche textuelle filtrée par nom.'
    })
    @ApiResponse({
        status: 200,
        description: 'Liste paginée récupérée avec succès.',
        schema: {
            example: {
                data: [{ id: 1, name: 'FINANCE', roles: [] }],
                meta: { total: 1, page: 1, lastPage: 1, limit: 20 }
            }
        }
    })

    async findAll(@Query() query: DepartmentFiltersDto) {
        return await this.departmentService.findAll(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('department:read')
    @ApiOperation({
        summary: 'Obtenir les détails d’un département',
        description: 'Récupère la fiche d\'un département spécifique incluant ses rôles, ses permissions associées et le volume d\'utilisateurs actifs.'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Identifiant numérique unique du département' })
    @ApiOkResponse({ description: 'Département trouvé et retourné.' })
    @ApiResponse({ status: 404, description: 'Département introuvable.' })

    async findOne(@Param('id', ParseIntPipe) id: number) { // 💡 Ajout de ParseIntPipe pour garantir un type 'number'
        return await this.departmentService.findOne(id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('department:update')
    @ApiOperation({
        summary: 'Modifier un département',
        description: 'Permet de modifier le libellé. Si le nom envoyé est identique à l\'ancien ou vide, la transaction est ignorée.'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Identifiant numérique du département à modifier' })
    @ApiOkResponse({ description: 'Département mis à jour avec succès.' })
    @ApiResponse({ status: 404, description: 'Département introuvable.' })
    @ApiResponse({ status: 409, description: 'Conflit : Le nouveau nom choisi est déjà attribué.' })

    async update(
        @Param('id') id: number,
        @Body() dto: UpdateDepartmentDto,
        @GetUser('sub') actorId: string,
    ) {
        return await this.departmentService.update(id, dto, actorId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('department:delete')
    @ApiOperation({
        summary: 'Supprimer définitivement un département',
        description: 'Supprime l\'enregistrement. La contrainte d\'intégrité échouera (409) si le département possède encore des rôles ou des employés rattachés.'
    })
    @ApiParam({ name: 'id', type: Number, description: 'Identifiant numérique du département à supprimer' })
    @ApiOkResponse({ description: 'Département supprimé avec succès de l\'organigramme.' })
    @ApiResponse({ status: 404, description: 'Département introuvable.' })
    @ApiResponse({
        status: 409,
        description: 'Conflit : Impossible de supprimer, le département est lié à des entités dépendantes.'
    })

    async remove(
        @Param('id') id: number,
        @GetUser('sub') actorId: string
    ) {
        return await this.departmentService.remove(id, actorId);
    }
}