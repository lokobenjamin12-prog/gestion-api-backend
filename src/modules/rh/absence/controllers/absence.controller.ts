// src/absence/absence.controller.ts
import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiResponse, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { AbsenceService } from '../services/absence.service';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AjouterAbsenceDto } from '../dto/ajouter-absence.dto';
import { MettreAJourJourAbsenceDto } from '../dto/mettre-a-jour-jour-absence.dto';
import { SupprimerJourAbsenceDto } from '../dto/supprimer-jour-absencedto';
import { FindAllAbsencesDto } from '../dto/find-all-absences.dto';
import { FindOneAbsenceDto } from '../dto/find-one-absence.dto';
import { RequireContratBoth } from 'src/common/decorators/require-contrat.decorator';

@ApiTags('Absences & Congés')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Authentification requise : Token JWT manquant ou expiré.' })
@ApiResponse({ status: 403, description: 'Accès refusé : Permissions insuffisantes ou anomalie de contrat.' })
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('absences')

export class AbsenceController {
    constructor(private readonly absenceService: AbsenceService) { }

    @Post('jours')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('absence:create')
    @RequireContratBoth()
    @ApiOperation({
        summary: 'Allouer des jours d\'absence',
        description: 'Permet à un administrateur ou RH d\'enregistrer une période d\'absence pour un collaborateur.'
    })
    @ApiOkResponse({
        description: 'Jours d\'absence alloués et enregistrés avec succès.',
    })
    async ajouterJours(
        @Body() dto: AjouterAbsenceDto,
        @GetUser('sub') actorId: string,
    ) {
        return this.absenceService.ajouterJours(dto, actorId);
    }

    @Patch('jour')
    @HttpCode(HttpStatus.OK) // Renvoie un statut 200 OK explicite
    @RequirePermissions('absence:update')
    @RequireContratBoth()
    @ApiOperation({
        summary: 'Modifier un jour d\'absence',
        description: 'Met à jour les détails ou le motif d\'un jour d\'absence spécifique.'
    })
    @ApiOkResponse({
        description: 'Jour d\'absence mis à jour avec succès.'
    })
    async mettreAJourJour(
        @Body() dto: MettreAJourJourAbsenceDto,
        @GetUser('sub') actorId: string, // Extraction sécurisée de l'ID de l'admin/RH connecté
    ) {
        return this.absenceService.mettreAJourJour(dto, actorId);
    }

    @Delete('jour')
    @HttpCode(HttpStatus.OK) // Par défaut, un DELETE renvoie 200 OK (ou 204 No Content s'il n'y a pas de corps de retour)
    @RequirePermissions('absence:delete')
    @RequireContratBoth()
    @ApiOperation({
        summary: 'Supprimer un jour d\'absence',
        description: 'Retire définitivement un jour d\'absence du planning d\'un collaborateur.'
    })
    @ApiOkResponse({
        description: 'Jour d\'absence supprimé avec succès de la base PostgreSQL.'
    })
    async supprimerJour(
        @Body() dto: SupprimerJourAbsenceDto,
        @GetUser('sub') actorId: string, // Extraction sécurisée de l'ID de l'admin connecté
    ) {
        return this.absenceService.supprimerJour(dto, actorId);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('absence:read')
    @ApiOperation({
        summary: 'Lister et filtrer toutes les absences',
        description: 'Récupère la liste paginée des absences avec filtres optionnels par utilisateur ou statut.'
    })
    @ApiOkResponse({
        description: 'Liste des absences récupérée avec succès.'
    })

    async findAll(@Query() dto: FindAllAbsencesDto) {
        return this.absenceService.findAll(dto);
    }

    @Get(':userId/:mois/:annee')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('absence:read')
    @ApiOperation({
        summary: 'Consulter le bilan d\'un utilisateur pour un mois donné',
        description: 'Extrait le relevé complet des absences d\'un agent pour un mois et une année spécifiques.'
    })
    @ApiOkResponse({
        description: 'Fiche d\'absence mensuelle trouvée et retournée.'
    })

    async findOne(@Param() dto: FindOneAbsenceDto) {
        return this.absenceService.findOne(dto);
    }
}