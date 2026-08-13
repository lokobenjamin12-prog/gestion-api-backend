import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { AjouterRetardDto } from '../dto/ajouter-retard-dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RetardService } from '../services/retard.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { MettreAJourJourRetardDto } from '../dto/mettreAjour-jour-retard.dto';
import { SupprimerJourRetardDto } from '../dto/supprimer-jour-retard.dto';
import { FindAllRetardsDto } from '../dto/find-all-retards.dto';
import { FindOneRetardDto } from '../dto/find-one-retard-dto';
import { RequireContratBoth } from 'src/common/decorators/require-contrat.decorator';


@ApiTags('Gestion des Retards')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Authentification requise : Token JWT manquant ou expiré.' })
@ApiResponse({ status: 403, description: 'Accès interdit : Permissions insuffisantes ("retard:*" manquante).' })
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('retards')

export class RetardController {

    constructor(private readonly retardService: RetardService) { }

    @Post('jours')
    @HttpCode(HttpStatus.OK) // Permet de retourner un code 200 OK sémantiquement adapté aux cas de mise à jour / fusion
    @RequirePermissions('retard:create')
    @RequireContratBoth()
    @ApiOperation({
        summary: 'Ajouter ou fusionner des jours de retard',
        description: 'Enregistre un ou plusieurs retards pour un collaborateur. Si un retard existe déjà à cette date, les minutes peuvent être cumulées ou mises à jour.'
    })
    @ApiOkResponse({ description: 'Jours de retard ajoutés ou mis à jour avec succès.' })

    async ajouterJours(
        @Body() dto: AjouterRetardDto,
        @GetUser('sub') actorId: string, // Extraction sécurisée de l'ID de l'admin connecté
    ) {
        return this.retardService.ajouterJours(dto, actorId);
    }


    @Patch('jour')
    @RequirePermissions('retard:update')
    @RequireContratBoth()
    @HttpCode(HttpStatus.OK) // Permet de retourner un code 200 OK sémantiquement adapté aux cas de mise à jour / fusion    
    @ApiOperation({
        summary: 'Modifier la durée d\'un jour de retard précis',
        description: 'Permet de corriger le volume de minutes de retard ou de modifier son statut pour une journée spécifique.'
    })
    @ApiOkResponse({ description: 'Le jour de retard a été modifié avec succès.' })
    @ApiResponse({ status: 404, description: 'Aucun enregistrement de retard trouvé pour cette date.' })

    async mettreAJourJour(
        @Body() dto: MettreAJourJourRetardDto,
        @GetUser('sub') actorId: string, // Extraction sécurisée de l'ID de l'admin connecté depuis le JWT
    ) {
        return this.retardService.mettreAJourJour(dto, actorId);
    }


    @Delete('jour')
    @RequirePermissions('retard:delete')
    @RequireContratBoth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Supprimer un enregistrement de retard',
        description: 'Retire définitivement la pénalité ou la ligne de retard associée à un collaborateur pour un jour donné.'
    })
    @ApiOkResponse({ description: 'Enregistrement de retard supprimé avec succès.' })
    @ApiResponse({ status: 404, description: 'Retard introuvable.' })

    async supprimerJour(
        @Body() dto: SupprimerJourRetardDto,
        @GetUser('sub') actorId: string, // Extraction sécurisée de l'ID de l'admin depuis le token
    ) {
        return this.retardService.supprimerJour(dto, actorId);
    }


    @Get()
    @RequirePermissions('retard:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Lister et filtrer tous les retards',
        description: 'Récupère l\'historique global des retards de l\'ensemble des utilisateurs avec pagination et filtres (mois, année, userId).'
    })
    @ApiOkResponse({
        description: 'Liste des retards récupérée avec succès.',
        // type: [RetardResponseDto] // Décommentez si vous utilisez un DTO de réponse
    })

    async findAll(@Query() dto: FindAllRetardsDto) {
        return this.retardService.findAll(dto);
    }

    @Get(':userId/:mois/:annee')
    @RequirePermissions('retard:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consulter les retards d\'un employé pour un mois ciblé',
        description: 'Extrait le planning et le cumul des minutes de retard d\'un collaborateur précis pour un mois et une année donnés.'
    })
    @ApiParam({ name: 'userId', description: 'Identifiant unique (UUID/CUID) du collaborateur', type: String })
    @ApiParam({ name: 'mois', description: 'Numéro du mois (1 à 12)', type: Number, example: 7 })
    @ApiParam({ name: 'annee', description: 'Année concernée (ex: 2026)', type: Number, example: 2026 })
    @ApiOkResponse({ description: 'Fiche mensuelle des retards de l\'utilisateur récupérée.' })
    @ApiResponse({ status: 404, description: 'Collaborateur ou période introuvable.' })

    async findOne(@Param() dto: FindOneRetardDto) {
        return this.retardService.findOne(dto);
    }

}