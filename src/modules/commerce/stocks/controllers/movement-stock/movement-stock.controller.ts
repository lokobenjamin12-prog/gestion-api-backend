import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { StockService } from '../../services/stock/stock.service';
import { CreateMovementDto } from '../../dto/request/create-movement.dto';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';

import { Logger } from '@nestjs/common';
import { GetHistoriqueDto } from '../../dto/request/get-historique.dto';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { RequireContratActor } from 'src/common/decorators/require-contrat.decorator';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('Logistique & Mouvements de Stock') // Regroupement clair et professionnel dans l'UI
@ApiCookieAuth('access_token') // Authentification par cookies globale de Ndolecam
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('movement-stock')

export class MovementStockController {
    constructor(private readonly stockService: StockService) { }
    private readonly logger = new Logger(MovementStockController.name);

    @Post('mouvements')
    @RequirePermissions('movement:create')
    @RequireContratActor()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Enregistrer un nouveau mouvement de stock',
        description: 'Permet d\'effectuer une entrée, une sortie, un réajustement ou un transfert de stock. Met à jour l\'état des inventaires.',
    })
    @ApiResponse({ status: 201, description: 'Mouvement de stock traité et enregistré avec succès.' })
    @ApiResponse({ status: 400, description: 'Données du mouvement invalides ou stock insuffisant.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes (\'movement:create\' requis).' })

    processMovement(@Body() dto: CreateMovementDto, @Req() req: any) {
        return this.stockService.processMovement(dto, req.user);
    }

    @Get('get-stocks')
    @RequirePermissions('movement:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtenir la vue d’ensemble des stocks de l\'entrepôt',
        description: 'Retourne l\'état des stocks actuels pour l\'ensemble des articles du catalogue.',
    })
    @ApiResponse({ status: 200, description: 'Vue d\'ensemble des stocks récupérée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    async getStockOverview() {
        this.logger.log('📥 Requête reçue : Vue d’ensemble des stocks');
        return await this.stockService.getStockOverview();
    }

    @Get('Obtenir-Articles-En-Alerte')
    @RequirePermissions('movement:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Lister les articles en alerte de stock (Seuil critique)',
        description: 'Extrait la liste des produits dont la quantité actuelle est inférieure ou égale au seuil de sécurité configuré (utile pour vos alertes automatiques).',
    })
    @ApiResponse({ status: 200, description: 'Liste des articles en alerte générée avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })


    async getAlerts() {
        this.logger.log('📥 Requête API : Récupération des alertes de stock');
        return await this.stockService.getArticlesEnAlerte();
    }


    @Get('mouvements')
    @RequirePermissions('movement:read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consulter l\'historique paginé des mouvements de stock',
        description: 'Permet de tracer l\'ensemble des flux logistiques (entrées/sorties) passés sur le système avec filtres et pagination.',
    })
    @ApiResponse({ status: 200, description: 'Historique des mouvements de stock retourné avec succès.' })
    @ApiResponse({ status: 401, description: 'Non authentifié.' })
    @ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })

    async getMouvements(@Query() query: GetHistoriqueDto) {
        this.logger.log(`📥 Requête : Historique (Page ${query.page}, Limite ${query.limit})`);

        // On passe directement le DTO au service
        return await this.stockService.getMouvementsStock(query);
    }
}
