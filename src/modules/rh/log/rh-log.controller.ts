import { Controller, Get, Param, Query } from '@nestjs/common';
import { RhLogService } from './rh-log.service';
import { RhLogFiltersDto } from './dto/rh-log-filters.dto';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Audit & Logs RH')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Authentification requise : Token JWT absent ou expiré.' })
@ApiResponse({ status: 403, description: 'Accès interdit : Permission "rh-log:read" manquante.' })
@Controller('rh-logs')
export class RhLogController {
    constructor(private readonly rhLog: RhLogService) { }

    // ─── GET /rh-logs ─────────────────────────────────────────────────────────
    // Liste paginée avec tous les filtres
    // ex: GET /rh-logs?module=ABSENCE&level=WARNING&page=1&limit=20
    @Get()
    @RequirePermissions('rh-log:read')
    @ApiOperation({
        summary: 'Lister et filtrer l\'historique des logs d\'audit',
        description: 'Récupère une liste paginée des actions exécutées sur le système (création de contrat, modification d\'absence, etc.) triées par pertinence chronologique.'
    })
    @ApiOkResponse({
        description: 'Liste paginée des logs d\'audit retournée avec succès.',
        // type: [RhLogResponseDto] // Décommentez si vous avez un DTO de réponse
    })
    findAll(@Query() filters: RhLogFiltersDto) {
        return this.rhLog.findAll(filters);
    }

    // ─── GET /rh-logs/stats ───────────────────────────────────────────────────
    // Répartition par niveau, module et état
    @Get('stats')
    @RequirePermissions('rh-log:read')
    @ApiOperation({
        summary: 'Obtenir les statistiques globales d\'audit',
        description: 'Renvoie une vue d\'ensemble agrégée de la répartition des logs par niveau de sévérité (INFO/WARN/ERROR), par module fonctionnel et par statut (SUCCESS/FAILED).'
    })
    @ApiOkResponse({
        description: 'Statistiques d\'audit générées avec succès.',
        schema: {
            example: {
                parNiveau: { INFO: 150, WARN: 12, ERROR: 2 },
                parModule: { CONTRAT: 80, ABSENCE: 64, DEPARTMENT: 20 },
                parEtat: { SUCCESS: 158, FAILED: 6 }
            }
        }
    })
    getStats() {
        return this.rhLog.getStats();
    }

    // ─── GET /rh-logs/actor/:actorId ──────────────────────────────────────────
    // Tous les logs d'un acteur spécifique
    @Get('actor/:actorId')
    @RequirePermissions('rh-log:read')
    @ApiOperation({
        summary: 'Lister les actions d\'un acteur spécifique',
        description: 'Extrait l\'historique d\'activité complet d\'un utilisateur donné (auteur des modifications) avec support des filtres additionnels et de la pagination.'
    })
    @ApiParam({ name: 'actorId', description: 'Identifiant unique (UUID ou CUID) de l\'utilisateur ciblé' })
    @ApiOkResponse({ description: 'Logs de l\'acteur récupérés avec succès.' })

    findByActor(
        @Param('actorId') actorId: string,
        @Query() filters: RhLogFiltersDto,
    ) {
        return this.rhLog.findByActor(actorId, filters);
    }

    // ─── GET /rh-logs/:id ─────────────────────────────────────────────────────
    // Détail complet d'un log (inclut valeurAvant/valeurApres)
    @Get(':id')
    @RequirePermissions('rh-log:read')
    @ApiOperation({
        summary: 'Consulter le détail complet d\'un log d\'audit',
        description: 'Récupère la fiche unitaire d\'une entrée d\'audit. Utile pour inspecter les métadonnées techniques profonds comme les deltas de modifications (valeurAvant / valeurApres).'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique du log d\'audit (UUID/CUID)' })
    @ApiOkResponse({ description: 'Fiche de log d\'audit trouvée et retournée.' })
    @ApiResponse({ status: 404, description: 'Log d\'audit introuvable.' })

    findOne(@Param('id') id: string) {
        return this.rhLog.findOne(id);
    }
}