import { Injectable } from '@nestjs/common';
import { AuthModule, CommerceModule, RhModule } from '@prisma/client';
import { AuthLogService } from '../auth/log/auth-log.service';
import { AuthLogFiltersDto } from '../auth/log/dto/auth-log-filters.dto';
import { CommerceLogService } from '../commerce/log/commerce-log.service';
import { CommerceLogFiltersDto } from '../commerce/log/dto/commerce-log-filters.dto';
import { RhLogService } from '../rh/log/rh-log.service';
import { RhLogFiltersDto } from '../rh/log/dto/rh-log-filters.dto';
import { LogQueryFiltersDto } from './dto/log-query-filters.dto';

// Article, Catégorie et Mouvement de stock partagent tous CommerceModule.STOCK en
// base : on les distingue via un mot-clé contenu dans le champ `action`.
// 'CATEGOR' (plutôt que 'CATEGORY') couvre à la fois CATEGORY et CATEGORIES.
const STOCK_ACTION_KEYWORDS = {
    ARTICLE: 'ARTICLE',
    CATEGORY: 'CATEGOR',
    MOUVEMENT: 'MOUVEMENT',
} as const;

export interface LogSubModuleSummary {
    key: string;
    label: string;
    path: string;
    total: number;
}

type SubModuleDefinition = {
    key: string;
    label: string;
    path: string;
    fetch: (filters: LogQueryFiltersDto) => Promise<{ meta: { total: number } }>;
};

@Injectable()
export class LogService {
    constructor(
        private readonly authLog: AuthLogService,
        private readonly commerceLog: CommerceLogService,
        private readonly rhLog: RhLogService,
    ) { }

    // ─── Sous-modules Commerce / Stock ────────────────────────────────────────
    articles(filters: LogQueryFiltersDto) {
        return this.commerceLog.findAll(this.stockFilters(filters, STOCK_ACTION_KEYWORDS.ARTICLE));
    }

    categories(filters: LogQueryFiltersDto) {
        return this.commerceLog.findAll(this.stockFilters(filters, STOCK_ACTION_KEYWORDS.CATEGORY));
    }

    mouvementsStock(filters: LogQueryFiltersDto) {
        return this.commerceLog.findAll(this.stockFilters(filters, STOCK_ACTION_KEYWORDS.MOUVEMENT));
    }

    salesSession(filters: LogQueryFiltersDto) {
        return this.commerceLog.findAll({ ...filters, module: CommerceModule.SALES_SESSION });
    }

    private stockFilters(filters: LogQueryFiltersDto, actionKeyword: string): CommerceLogFiltersDto {
        return { ...filters, module: CommerceModule.STOCK, action: actionKeyword };
    }

    // ─── Sous-modules Authentification ────────────────────────────────────────
    authentification(filters: LogQueryFiltersDto) {
        return this.authLog.findByModule(AuthModule.AUTH, filters as AuthLogFiltersDto);
    }

    permissions(filters: LogQueryFiltersDto) {
        return this.authLog.findByModule(AuthModule.PERMISSION, filters as AuthLogFiltersDto);
    }

    roles(filters: LogQueryFiltersDto) {
        return this.authLog.findByModule(AuthModule.ROLE, filters as AuthLogFiltersDto);
    }

    users(filters: LogQueryFiltersDto) {
        return this.authLog.findByModule(AuthModule.USER, filters as AuthLogFiltersDto);
    }

    // ─── Sous-modules RH ───────────────────────────────────────────────────────
    absences(filters: LogQueryFiltersDto) {
        return this.rhLog.findAll({ ...filters, module: RhModule.ABSENCE } as RhLogFiltersDto);
    }

    contrats(filters: LogQueryFiltersDto) {
        return this.rhLog.findAll({ ...filters, module: RhModule.CONTRAT } as RhLogFiltersDto);
    }

    departements(filters: LogQueryFiltersDto) {
        return this.rhLog.findAll({ ...filters, module: RhModule.DEPARTMENT } as RhLogFiltersDto);
    }

    rapports(filters: LogQueryFiltersDto) {
        return this.rhLog.findAll({ ...filters, module: RhModule.RAPPORT } as RhLogFiltersDto);
    }

    retards(filters: LogQueryFiltersDto) {
        return this.rhLog.findAll({ ...filters, module: RhModule.RETARD } as RhLogFiltersDto);
    }

    salaires(filters: LogQueryFiltersDto) {
        return this.rhLog.findAll({ ...filters, module: RhModule.SALAIRE } as RhLogFiltersDto);
    }

    // ─── Vue d'ensemble ────────────────────────────────────────────────────────
    private get subModuleDefinitions(): SubModuleDefinition[] {
        return [
            { key: 'articles', label: 'Articles', path: '/logs/articles', fetch: (f) => this.articles(f) },
            { key: 'categories', label: 'Catégories', path: '/logs/categories', fetch: (f) => this.categories(f) },
            { key: 'mouvements-stock', label: 'Mouvements de stock', path: '/logs/mouvements-stock', fetch: (f) => this.mouvementsStock(f) },
            { key: 'authentification', label: 'Authentification', path: '/logs/authentification', fetch: (f) => this.authentification(f) },
            { key: 'permissions', label: 'Permissions', path: '/logs/permissions', fetch: (f) => this.permissions(f) },
            { key: 'roles', label: 'Rôles', path: '/logs/roles', fetch: (f) => this.roles(f) },
            { key: 'users', label: 'Utilisateurs', path: '/logs/users', fetch: (f) => this.users(f) },
            { key: 'sales-session', label: 'Sessions de vente', path: '/logs/sales-session', fetch: (f) => this.salesSession(f) },
            { key: 'absences', label: 'Absences', path: '/logs/absences', fetch: (f) => this.absences(f) },
            { key: 'contrats', label: 'Contrats', path: '/logs/contrats', fetch: (f) => this.contrats(f) },
            { key: 'departements', label: 'Départements', path: '/logs/departements', fetch: (f) => this.departements(f) },
            { key: 'rapports', label: 'Rapports', path: '/logs/rapports', fetch: (f) => this.rapports(f) },
            { key: 'retards', label: 'Retards', path: '/logs/retards', fetch: (f) => this.retards(f) },
            { key: 'salaires', label: 'Salaires', path: '/logs/salaires', fetch: (f) => this.salaires(f) },
        ];
    }

    async getOverview(): Promise<LogSubModuleSummary[]> {
        const probe: LogQueryFiltersDto = { page: 1, limit: 1 };
        return Promise.all(
            this.subModuleDefinitions.map(async (def) => {
                const result = await def.fetch(probe);
                return { key: def.key, label: def.label, path: def.path, total: result.meta.total };
            }),
        );
    }

    async getGlobalStats() {
        const [authentification, commerce, rh] = await Promise.all([
            this.authLog.getStats(),
            this.commerceLog.getStats(),
            this.rhLog.getStats(),
        ]);

        return {
            total: authentification.total + commerce.total + rh.total,
            authentification,
            commerce,
            rh,
        };
    }
}
