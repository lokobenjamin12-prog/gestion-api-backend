// src/contrat/contrat.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Patch,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse, ApiCreatedResponse, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { ContratService } from '../services/contrat.service';
import { ContratType } from '@prisma/client';
import { CreateContratDto } from '../dto/create-contrat.dto';
import { UpdateContratDto } from '../dto/update-contrat.dto';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RequireContratActor } from 'src/common/decorators/require-contrat.decorator';


@ApiTags('Contrats & Alertes RH')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Authentification requise : Token JWT manquant, invalide ou expiré.' })
@ApiResponse({ status: 403, description: 'Accès interdit : Permissions insuffisantes pour manipuler les contrats.' })
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('contrats')
export class ContratController {
    constructor(private readonly contratService: ContratService) { }


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions('contrat:create')
    @ApiOperation({
        summary: 'Créer un contrat (CDD ou CDI)',
        description: 'Initialise un nouveau contrat de travail en base de données pour un employé.'
    })
    @ApiCreatedResponse({
        description: 'Le contrat a été créé et enregistré avec succès.',
    })

    async create(
        @Body() dto: CreateContratDto,
        @GetUser('sub') actorId: string
    ) {
        // Une sécurité supplémentaire au cas où le décorateur renvoie vide
        if (!actorId) {
            throw new BadRequestException("Impossible d'identifier l'auteur de l'action, car requête non authentifiée (actorId vide)");
        }
        return await this.contratService.create(dto, actorId);
    }

    // @Get()
    // @HttpCode(HttpStatus.OK)
    // @RequirePermissions('contrat:read')
    // @ApiOperation({
    //     summary: 'Lister et filtrer les contrats',
    //     description: 'Récupère tous les contrats avec la possibilité de filtrer par collaborateur ou par type de contrat (CDI/CDD).'
    // })
    // @ApiQuery({ name: 'userId', required: false, description: 'Filtrer par l\'identifiant unique de l\'employé' })
    // @ApiQuery({ name: 'type', enum: ['CDD', 'CDI'], required: false, description: 'Filtrer par nature du contrat' })
    // @ApiOkResponse({
    //     description: 'Liste des contrats récupérée avec succès.',
    // })
    // async findAll(
    //     @Query('userId') userId?: string,
    //     @Query('type') type?: ContratType,
    // ) {
    //     return await this.contratService.findAll({ userId, type });
    // }



    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('contrat:read')
    @ApiOperation({
        summary: 'Lister et filtrer les contrats',
        description: 'Récupère tous les contrats avec la possibilité de filtrer par collaborateur, type ou plage de date de début.'
    })
    @ApiQuery({ name: 'userId', required: false, description: 'Filtrer par l\'identifiant unique de l\'employé' })
    @ApiQuery({ name: 'type', enum: ['CDD', 'CDI'], required: false, description: 'Filtrer par nature du contrat' })
    @ApiQuery({ name: 'dateDebutFrom', required: false, description: 'Date de début minimale (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateDebutTo', required: false, description: 'Date de début maximale (YYYY-MM-DD)' })
    @ApiQuery({ name: 'includeArchived', required: false, type: Boolean, description: 'Inclure les contrats archivés' })
    @ApiOkResponse({
        description: 'Liste des contrats récupérée avec succès.',
    })
    async findAll(
        @Query('userId') userId?: string,
        @Query('type') type?: ContratType,
        @Query('dateDebutFrom') dateDebutFrom?: string,
        @Query('dateDebutTo') dateDebutTo?: string,
        @Query('includeArchived') includeArchived?: string,
    ) {
        return await this.contratService.findAll({
            userId,
            type,
            dateDebutFrom,
            dateDebutTo,
            includeArchived: includeArchived === 'true',
        });
    }



    @Get('expirations')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('contrat:read')
    @ApiOperation({
        summary: 'Détecter les CDD expirant prochainement',
        description: 'Analyse les contrats à durée déterminée et remonte ceux dont la date de fin approche du seuil d\'alerte.'
    })
    @ApiQuery({ name: 'delai', required: false, description: 'Nombre de jours restants avant l\'expiration (Valeur par défaut : 30)' })
    @ApiOkResponse({
        description: 'Liste des contrats arrivant à échéance calculée avec succès.',
    })
    async getExpirationsProches(
        @Query('delai') delai?: string
    ) {
        return await this.contratService.getExpirationsProches(
            delai ? parseInt(delai, 10) : 30,
        );
    }


    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('contrat:read')
    @ApiOperation({
        summary: 'Obtenir les détails d\'un contrat',
        description: 'Récupère la fiche complète d\'un contrat de travail à partir de son identifiant unique.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique du contrat (UUID/CUID)' })
    @ApiOkResponse({
        description: 'Contrat trouvé et retourné avec succès.',
    })

    async findOne(@Param('id') id: string) {
        return await this.contratService.findOne(id);
    }


    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('contrat:update')
    @RequireContratActor()
    @ApiOperation({
        summary: 'Modifier un contrat existant',
        description: 'Met à jour les clauses, le salaire ou les dates d\'un contrat actif.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique du contrat à modifier' })
    @ApiOkResponse({
        description: 'Le contrat a été mis à jour avec succès.',
    })

    async update(
        @Param('id') id: string,
        @Body() dto: UpdateContratDto,
        @GetUser('sub') actorId: string
    ) {
        return await this.contratService.update(id, dto, actorId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('contrat:delete')
    @RequireContratActor()
    @ApiOperation({
        summary: 'Suppression logique d\'un contrat',
        description: 'Archive logiquement le contrat (soft delete) pour préserver l\'historique des alertes logistiques et RH.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique du contrat à archiver' })
    @ApiOkResponse({
        description: 'Contrat archivé logiquement avec succès.'
    })

    async softDelete(
        @Param('id') id: string,
        @GetUser('sub') actorId: string
    ) {
        return await this.contratService.softDelete(id, actorId);
    }

    @Patch(':id/restore')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('contrat:restore')
    @RequireContratActor()
    @ApiOperation({
        summary: 'Restaurer un contrat archivé',
        description: 'Réactive un contrat précédemment supprimé logiquement pour le rendre à nouveau opérationnel.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique du contrat à restaurer' })
    @ApiOkResponse({
        description: 'Contrat restauré avec succès dans le catalogue actif.'
    })

    restore(@Param('id') id: string, @GetUser('sub') actorId: string) {
        if (!actorId) {
            throw new BadRequestException("Impossible d'identifier l'auteur de l'action, car requête non authentifiée (actorId vide)");
        }
        return this.contratService.restore(id, actorId);
    }
}