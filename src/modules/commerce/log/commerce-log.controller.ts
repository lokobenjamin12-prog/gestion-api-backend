import { Controller, Get, Param, Query } from '@nestjs/common';
import { CommerceLogService } from './commerce-log.service';
import { CommerceLogFiltersDto } from './dto/commerce-log-filters.dto';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';

import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Audit & Logs Commerciaux') // Regroupement clair dans l'UI Swagger
@ApiCookieAuth('access_token') // Unification de la stratégie de sécurité par cookies
@Controller('commerce-logs')
export class CommerceLogController {
    constructor(private readonly commerceLog: CommerceLogService) { }

    // ─── GET /commerce-logs ───────────────────────────────────────────────────
    // Liste paginée avec tous les filtres
    // ex: GET /commerce-logs?module=STOCK&level=WARNING&page=1&limit=20
    @Get()
    @RequirePermissions('commerce-log:read')
    @ApiOperation({
        summary: 'Récupérer la liste paginée et filtrée des logs d\'audit commerciaux',
        description: 'Permet de suivre toutes les activités critiques (ventes, stocks, facturation). Supporte le filtrage multicritères et la pagination.',
    })
    @ApiResponse({ status: 200, description: 'Liste des logs récupérée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'commerce-log:read\' requis).' })


    findAll(@Query() filters: CommerceLogFiltersDto) {
        return this.commerceLog.findAll(filters);
    }

    // ─── GET /commerce-logs/stats ─────────────────────────────────────────────
    // Répartition par niveau, module et état
    @Get('stats')
    @RequirePermissions('commerce-log:read')
    @ApiOperation({
        summary: 'Obtenir les statistiques globales d\'activité d\'audit',
        description: 'Retourne la répartition agrégée des logs par niveau de sévérité (INFO, WARN, ERROR), par module et par état (SUCCESS, FAILED). Idéal pour alimenter les graphiques de votre tableau de bord HR/Admin.',
    })
    @ApiResponse({ status: 200, description: 'Statistiques calculées et retournées avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    getStats() {
        return this.commerceLog.getStats();
    }

    // ─── GET /commerce-logs/actor/:actorId ────────────────────────────────────
    // Tous les logs d'un acteur spécifique
    @Get('actor/:actorId')
    @RequirePermissions('commerce-log:read')
    @ApiOperation({
        summary: 'Historique d\'audit complet pour un acteur/utilisateur spécifique',
        description: 'Extrait toutes les actions enregistrées en base associées à un UUID utilisateur, tout en appliquant les filtres additionnels de pagination ou de dates.',
    })
    @ApiParam({
        name: 'actorId',
        description: 'Identifiant unique (UUID) de l\'employé ou de l\'acteur technique.',
        example: 'usr_abc123xyz',
    })
    @ApiResponse({ status: 200, description: 'Logs de l\'acteur récupérés avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Acteur introuvable.' })

    findByActor(
        @Param('actorId') actorId: string,
        @Query() filters: CommerceLogFiltersDto,
    ) {
        return this.commerceLog.findByActor(actorId, filters);
    }

    // ─── GET /commerce-logs/:id ───────────────────────────────────────────────
    // Détail complet d'un log (inclut valeurAvant/valeurApres)
    @Get(':id')
    @RequirePermissions('commerce-log:read')
    @ApiOperation({
        summary: 'Consulter le détail complet d\'un log d\'audit',
        description: 'Retourne une ligne d\'audit détaillée. Inclut les métadonnées techniques ainsi que les états d\'historisation des données (`valeurAvant` et `valeurApres`) au format JSON.',
    })
    @ApiParam({
        name: 'id',
        description: 'Identifiant unique de la ligne de log d\'audit.',
        example: 'log_999888xyz',
    })
    @ApiResponse({ status: 200, description: 'Détail du log trouvé et retourné.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Enregistrement de log introuvable.' })

    findOne(@Param('id') id: string) {
        return this.commerceLog.findOne(id);
    }
}