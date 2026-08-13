// controllers/article.controller.ts
import {
    Body, Controller, Delete, Get,
    HttpCode,
    HttpStatus,
    Param, Patch, Post, Query, Req,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { CloseSessionDto, OpenSessionDto, SessionSummaryDto } from '../dto';
import { ServicesService } from '../services/services.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { GetSessionsFilterDto } from '../dto/request/get-sessions-filter.dto';
import { PaginatedSessionsResponseDto } from '../dto/response/paginated-sessions-response-dto';
import { GetCommercialSessionsDto } from '../dto/request/get-commercial-sessions.dto';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { RequireContratActor, RequireContratBoth } from 'src/common/decorators/require-contrat.decorator';

import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Audit & Logs Commerciaux') // Regroupement clair dans l'UI Swagger
@ApiCookieAuth('access_token') // Unification de la stratégie de sécurité par cookies
@UseGuards(AuthGuard, PermissionsGuard)
//@Controller('commerce-logs')
@Controller('sales-sessions')
export class ControllersController {
    constructor(private readonly salesSessionService: ServicesService) { }

    /**
     * POST /sales-sessions
     * Ouvre une session — MANAGER ou ADMIN uniquement
     */
    @Post('open-session')
    @RequirePermissions('salessession:create')
    @RequireContratBoth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Ouvrir une nouvelle session de vente',
        description: 'Permet à un administrateur ou un manager d\'ouvrir une caisse/session pour un commercial. Nécessite une validation de contrat actif.',
    })
    @ApiResponse({ status: 201, type: SessionSummaryDto, description: 'Session ouverte avec succès.' })
    @ApiResponse({ status: 400, description: 'Données d\'ouverture de session invalides.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'salessession:create\' requis).' })
    @ApiResponse({ status: 409, description: 'Le commercial possède déjà une session ouverte.' })


    async openSession(
        @Body() dto: OpenSessionDto,
        @GetUser('sub') userId: string
    ): Promise<SessionSummaryDto> {
        return await this.salesSessionService.openSession(dto, userId);
    }


    /**
     * PATCH /sales-sessions/:id/close
     * Clôture une session — MANAGER ou ADMIN uniquement
     */
    @Patch(':id/close-session') // Patch est plus sémantique pour une mise à jour d'état (clôture)
    @RequirePermissions('salessession:update')
    @RequireContratActor()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Clôturer une session de vente active',
        description: 'Arrête la session de vente, fige les calculs, enregistre le montant final théorique et calcule les écarts de caisse éventuels.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique (UUID/CUID) de la session de vente à fermer.', example: 'sess_abc123xyz' })
    @ApiResponse({ status: 200, type: SessionSummaryDto, description: 'Session clôturée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Session de vente introuvable.' })

    async closeSession(
        @Param('id') sessionId: string, // On valide que l'ID est un UUID
        @Body() dto: CloseSessionDto,
        @GetUser('sub') userId: string,
    ): Promise<SessionSummaryDto> {
        return this.salesSessionService.closeSession(sessionId, dto, userId);
    }


    /**
   * Annuler une session de vente ouverte
   * @param sessionId L'identifiant de la session (CUID ou UUID)
   * @param managerId L'ID du manager qui effectue l'action
   */
    @Patch(':id/cancel')
    @RequirePermissions('salessession:update')
    @RequireContratActor()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Annuler une session de vente ouverte',
        description: 'Permet d\'annuler une session ouverte par erreur. Cette action invalide la session sans générer de flux financiers régularisés.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de la session à annuler.', example: 'sess_abc123xyz' })
    @ApiQuery({ name: 'managerId', description: 'Identifiant du manager validant l\'annulation.', example: 'usr_mgr789' })
    @ApiResponse({ status: 200, type: SessionSummaryDto, description: 'Session annulée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Session introuvable.' })

    async cancelSession(
        @Param('id') sessionId: string,
        @Query('managerId') managerId: string,
    ): Promise<SessionSummaryDto> {
        // Appelle la méthoervde du sice que tu as fournie
        return await this.salesSessionService.cancelSession(sessionId, managerId);
    }


    /**
     * GET /sales-sessions
     * Liste toutes les sessions avec filtre optionnel ?status=OPEN|CLOSED
     *///@Controller('commerce-logs')
    @Get()
    @RequirePermissions('salessession:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Lister et filtrer l\'ensemble des sessions de vente',
        description: 'Retourne une liste paginée de toutes les sessions. Permet de filtrer par statut (ex: OPEN, CLOSED, CANCELLED).',
    })
    @ApiResponse({ status: 200, type: PaginatedSessionsResponseDto, description: 'Liste des sessions récupérée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    async findAll(
        @Query() filter: GetSessionsFilterDto
    ): Promise<PaginatedSessionsResponseDto> {
        return this.salesSessionService.findAll(filter);
    }

    /**
     * GET /sales-sessions/:id
     * Détail d'une session avec tous les champs calculés
     */
    @Get(':id') // La route sera : GET /sales-sessions/uuid-de-la-session
    @RequirePermissions('salessession:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consulter le détail complet d\'une session spécifique',
        description: 'Retourne toutes les informations calculées dynamiquement d\'une session de vente via son identifiant.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de la session.', example: 'sess_abc123xyz' })
    @ApiResponse({ status: 200, type: SessionSummaryDto, description: 'Données de la session trouvées.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
    @ApiResponse({ status: 404, description: 'Session introuvable.' })

    async findOne(
        @Param('id') id: string
    ): Promise<SessionSummaryDto> {
        return this.salesSessionService.findOne(id);
    }

    /**
     * GET /sales-sessions/commercial/:commercialId
     * Historique d'un commercial
     */

    @Get('commercial/:commercialId')
    @RequirePermissions('salessession:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtenir l\'historique des sessions d\'un commercial',
        description: 'Permet de récupérer toutes les sessions ouvertes ou fermées associées à un commercial spécifique avec support de pagination.',
    })
    @ApiParam({ name: 'commercialId', description: 'Identifiant unique du commercial.', example: 'usr_comm456' })
    @ApiResponse({ status: 200, type: PaginatedSessionsResponseDto, description: 'Historique du commercial récupéré avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    async findByCommercial(
        @Param('commercialId') commercialId: string,
        @Query() query: GetCommercialSessionsDto
    ): Promise<PaginatedSessionsResponseDto> {
        return this.salesSessionService.findByCommercial(commercialId, query);
    }

}






/*
OUVERTURE                           CLÔTURE
─────────                           ────────
Manager POST /sales-sessions        Manager PATCH /sales-sessions/:id/close
         │                                   │
         ▼                                   ▼
  Vérif stock suffisant          Vérif session OPEN
  Vérif 0 session OPEN           Vérif quantiteRetour ≤ quantiteDepart
         │                                   │
         ▼ $transaction                       ▼ $transaction
  MovementStock SORTIE           MovementStock ENTREE (invendus)
  ArticleStock.quantite ↓        ArticleStock.quantite ↑
  SalesSession créée (OPEN)      SalesSession mise à jour (CLOSED)
  UserLog "OPEN_SESSION"         UserLog "CLOSE_SESSION"
         │                                   │
         ▼                                   ▼
  Réponse SessionSummaryDto      Réponse avec calculs :
                                   quantiteVendue
                                   chiffreAffaireTheorique
                                   ecartCaisse
*/