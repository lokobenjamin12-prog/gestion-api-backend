import {
    Controller,
    Get,
    Param,
    Query,
} from '@nestjs/common';
import { AuthLogService } from './auth-log.service';
import { AuthLogFiltersDto } from './dto/auth-log-filters.dto';
import { AuthModule } from '@prisma/client';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';

// 1. Importation des décorateurs Swagger indispensables
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';

@Controller('auth-logs')
export class AuthLogController {
    constructor(private readonly authLog: AuthLogService) { }

    // ─── GET /auth-logs ────────────────────────────────────────────────────────
    // Liste paginée avec tous les filtres
    @Get()
    @RequirePermissions('auth-log:read')
    @ApiOperation({ summary: 'Lister et filtrer les journaux d\'authentification (Paginé)' })
    @ApiResponse({ status: 200, description: 'Liste des journaux d\'audit récupérée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié. Cookie de session manquant ou expiré.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'auth-log:read\' requis).' })

    findAll(@Query() filters: AuthLogFiltersDto) {
        return this.authLog.findAll(filters);
    }

    // ─── GET /auth-logs/stats ──────────────────────────────────────────────────
    // Statistiques globales (répartition par niveau, module, état)
    @Get('stats')
    @RequirePermissions('auth-log:read')
    @ApiOperation({ summary: 'Récupérer les statistiques globales des logs (Répartition par niveau, module, état)' })
    @ApiResponse({ status: 200, description: 'Statistiques calculées et retournées avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    getStats() {
        return this.authLog.getStats();
    }

    // ─── GET /auth-logs/actor/:actorId ────────────────────────────────────────
    // Tous les logs d'un acteur spécifique
    @Get('actor/:actorId')
    @RequirePermissions('auth-log:read')
    @ApiOperation({ summary: 'Récupérer tous les journaux d\'audit générés par un acteur spécifique' })
    @ApiParam({ name: 'actorId', description: 'L\'identifiant unique de l\'utilisateur/acteur en base', example: 'usr_lmlk89210' })
    @ApiResponse({ status: 200, description: 'Historique de l\'acteur extrait avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    findByActor(
        @Param('actorId') actorId: string,
        @Query() filters: AuthLogFiltersDto,
    ) {
        return this.authLog.findByActor(actorId, filters);
    }

    // ─── GET /auth-logs/module/:module ────────────────────────────────────────
    // Tous les logs d'un module spécifique (AUTH, USER, ROLE, PERMISSION)
    @Get('module/:module')
    @RequirePermissions('auth-log:read')
    @ApiOperation({ summary: 'Filtrer les journaux d\'audit par sous-module ciblé' })
    @ApiParam({ name: 'module', description: 'Nom du module applicatif', enum: AuthModule }) // 3. Dropdown automatique pour le paramètre d'URL
    @ApiResponse({ status: 200, description: 'Logs du module récupérés avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    findByModule(
        @Param('module') module: AuthModule,
        @Query() filters: AuthLogFiltersDto,
    ) {
        return this.authLog.findByModule(module, filters);
    }

    // ─── GET /auth-logs/:id ───────────────────────────────────────────────────
    // Détail complet d'un log (inclut valeurAvant/valeurApres)
    @Get(':id')
    @RequirePermissions('auth-log:read') @ApiOperation({ summary: 'Consulter le détail complet d\'une entrée de log (inclut l\'état avant/après modification)' })
    @ApiParam({ name: 'id', description: 'Identifiant unique de la ligne de log (ID UUID ou auto-incrémenté)', example: 'log_90a18f23' })
    @ApiResponse({ status: 200, description: 'Détail du log trouvé et retourné.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Ligne de log introuvable.' })

    findOne(@Param('id') id: string) {
        return this.authLog.findOne(id);
    }
}