import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { LogService } from './log.service';
import { LogQueryFiltersDto } from './dto/log-query-filters.dto';

@ApiTags('Logs (Vue centrale)')
@ApiCookieAuth('access_token')
@ApiResponse({ status: 401, description: 'Non authentifié.' })
@ApiResponse({ status: 403, description: 'Permissions insuffisantes.' })
@Controller('logs')
export class LogController {
    constructor(private readonly logService: LogService) { }

    // ─── GET /logs ─────────────────────────────────────────────────────────────
    // Vue d'ensemble : liste des sous-modules disponibles avec leur total
    @Get()
    @RequirePermissions('auth-log:read', 'commerce-log:read', 'rh-log:read')
    @ApiOperation({ summary: 'Vue d\'ensemble des sous-modules de logs disponibles (avec leur total)' })
    getOverview() {
        return this.logService.getOverview();
    }

    // ─── GET /logs/stats ───────────────────────────────────────────────────────
    // Statistiques globales combinées (Auth + Commerce + RH)
    @Get('stats')
    @RequirePermissions('auth-log:read', 'commerce-log:read', 'rh-log:read')
    @ApiOperation({ summary: 'Statistiques globales combinées (Authentification + Commerce + RH)' })
    getStats() {
        return this.logService.getGlobalStats();
    }

    // ─── Sous-modules Commerce / Stock ─────────────────────────────────────────
    @Get('articles')
    @RequirePermissions('commerce-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Article' })
    getArticles(@Query() filters: LogQueryFiltersDto) {
        return this.logService.articles(filters);
    }

    @Get('categories')
    @RequirePermissions('commerce-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Catégorie' })
    getCategories(@Query() filters: LogQueryFiltersDto) {
        return this.logService.categories(filters);
    }

    @Get('mouvements-stock')
    @RequirePermissions('commerce-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Mouvement de stock' })
    getMouvementsStock(@Query() filters: LogQueryFiltersDto) {
        return this.logService.mouvementsStock(filters);
    }

    @Get('sales-session')
    @RequirePermissions('commerce-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Session de vente' })
    getSalesSession(@Query() filters: LogQueryFiltersDto) {
        return this.logService.salesSession(filters);
    }

    // ─── Sous-modules Authentification ─────────────────────────────────────────
    @Get('authentification')
    @RequirePermissions('auth-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Authentification' })
    getAuthentification(@Query() filters: LogQueryFiltersDto) {
        return this.logService.authentification(filters);
    }

    @Get('permissions')
    @RequirePermissions('auth-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Permission' })
    getPermissions(@Query() filters: LogQueryFiltersDto) {
        return this.logService.permissions(filters);
    }

    @Get('roles')
    @RequirePermissions('auth-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Rôle' })
    getRoles(@Query() filters: LogQueryFiltersDto) {
        return this.logService.roles(filters);
    }

    @Get('users')
    @RequirePermissions('auth-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Utilisateur' })
    getUsers(@Query() filters: LogQueryFiltersDto) {
        return this.logService.users(filters);
    }

    // ─── Sous-modules RH ────────────────────────────────────────────────────────
    @Get('absences')
    @RequirePermissions('rh-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Absence' })
    getAbsences(@Query() filters: LogQueryFiltersDto) {
        return this.logService.absences(filters);
    }

    @Get('contrats')
    @RequirePermissions('rh-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Contrat' })
    getContrats(@Query() filters: LogQueryFiltersDto) {
        return this.logService.contrats(filters);
    }

    @Get('departements')
    @RequirePermissions('rh-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Département' })
    getDepartements(@Query() filters: LogQueryFiltersDto) {
        return this.logService.departements(filters);
    }

    @Get('rapports')
    @RequirePermissions('rh-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Rapport' })
    getRapports(@Query() filters: LogQueryFiltersDto) {
        return this.logService.rapports(filters);
    }

    @Get('retards')
    @RequirePermissions('rh-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Retard' })
    getRetards(@Query() filters: LogQueryFiltersDto) {
        return this.logService.retards(filters);
    }

    @Get('salaires')
    @RequirePermissions('rh-log:read')
    @ApiOperation({ summary: 'Logs du sous-module Salaire' })
    getSalaires(@Query() filters: LogQueryFiltersDto) {
        return this.logService.salaires(filters);
    }
}
