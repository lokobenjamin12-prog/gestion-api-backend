"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../../prisma/prisma.service");
const commerce_log_service_1 = require("../../../log/commerce-log.service");
const stock_realtime_gateway_1 = require("../../../realtime/stock-realtime.gateway");
let StockService = StockService_1 = class StockService {
    prisma;
    commerceLog;
    stockGateway;
    logger = new common_1.Logger(StockService_1.name);
    constructor(prisma, commerceLog, stockGateway) {
        this.prisma = prisma;
        this.commerceLog = commerceLog;
        this.stockGateway = stockGateway;
    }
    async processMovement(dto, currentUser) {
        const { articleStockId, quantite, type, motif, movementDate } = dto;
        const userId = currentUser?.sub;
        this.logger.log(`🔄 Mouvement ${type} sur le stock ID: ${articleStockId}`);
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const articleStock = await tx.articleStock.findUnique({
                    where: { id: articleStockId },
                    include: { article: true, category: true },
                });
                if (!articleStock || articleStock.deletedAt) {
                    throw new common_1.NotFoundException(`Le stock avec l'ID "${articleStockId}" n'existe pas ou est archivé.`);
                }
                const { article, category } = articleStock;
                const quantiteAvant = Number(articleStock.quantiteActuelle);
                const quantiteSaisie = Number(quantite);
                const quantiteApres = this.computeNewQuantity(type, quantiteAvant, quantiteSaisie, article.nom);
                const niveauApres = this.computeNiveauAlerte(quantiteApres, articleStock.seuilAlerte, articleStock.seuilCritique);
                const updateResult = await tx.articleStock.updateMany({
                    where: { id: articleStockId, quantiteActuelle: quantiteAvant },
                    data: { quantiteActuelle: quantiteApres, niveauAlerte: niveauApres, updatedAt: new Date() },
                });
                if (updateResult.count === 0) {
                    throw new common_1.ConflictException('Le stock a été mis à jour par un autre utilisateur. Veuillez valider à nouveau.');
                }
                const movement = await tx.movementStock.create({
                    data: {
                        type,
                        quantiteSortieOuEntree: quantiteSaisie,
                        motif,
                        quantiteAvant,
                        quantiteApres,
                        articleStockId,
                        userId,
                        articleId: article.id,
                        movementDate: movementDate || new Date(),
                    },
                });
                await this.commerceLog.info({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: `MOUVEMENT_${type}`,
                    entityId: movement.id,
                    entityName: `${article.nom} (${category.nomUnique})`,
                    avant: { quantite: quantiteAvant, niveauAlerte: articleStock.niveauAlerte },
                    apres: { quantite: quantiteApres, niveauAlerte: niveauApres },
                    message: `Mouvement ${type} : ${article.nom} (${category.nomUnique}) | ${quantiteAvant} → ${quantiteApres}`,
                    state: client_1.State.SUCCESS,
                }, tx);
                const prixUnite = category.prixUnite || 0;
                return {
                    movement: {
                        id: movement.id,
                        type: movement.type,
                        quantiteSortieOuEntree: movement.quantiteSortieOuEntree,
                        movementDate: movement.movementDate,
                    },
                    stock: {
                        articleId: article.id,
                        nomArticle: article.nom,
                        categorie: category.nomUnique,
                        prixUnite,
                        quantiteAvant,
                        quantiteApres,
                        valeurStock: quantiteApres * prixUnite,
                        niveauAvant: articleStock.niveauAlerte,
                        niveauApres,
                        niveauChange: articleStock.niveauAlerte !== niveauApres,
                    },
                    alerte: this.buildAlerte(niveauApres, `${article.nom} (${category.nomUnique})`, quantiteApres),
                };
            }, { isolationLevel: 'ReadCommitted' });
            this.stockGateway.emitStockUpdated({
                articleStockId,
                quantite: result.stock.quantiteApres,
                niveauAlerte: result.stock.niveauApres,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Erreur mouvement : ${error.message}`);
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.InternalServerErrorException('Erreur technique lors de la mise à jour du stock.');
        }
    }
    async getStockOverview() {
        this.logger.log("📊 Génération de la vue d'ensemble des stocks");
        const stocks = await this.prisma.articleStock.findMany({
            where: {
                deletedAt: null,
                article: { deletedAt: null },
                category: { deletedAt: null },
            },
            select: {
                id: true,
                quantiteActuelle: true,
                niveauAlerte: true,
                article: { select: { nom: true } },
                category: { select: { nomUnique: true, prixUnite: true } },
            },
            orderBy: { niveauAlerte: 'desc' },
        });
        return stocks.map((s) => {
            const valeurEstimee = s.quantiteActuelle * s.category.prixUnite;
            return {
                stockId: s.id,
                nomArticle: s.article.nom,
                categoryNom: s.category.nomUnique,
                prixUnitaireCategory: s.category.prixUnite,
                quantite: s.quantiteActuelle,
                niveauAlerte: s.niveauAlerte,
                valeurStock: valeurEstimee,
                alerte: this.buildAlerteStock(s.niveauAlerte, s.article.nom, s.quantiteActuelle),
            };
        });
    }
    async getArticlesEnAlerte() {
        this.logger.log('🚨 Filtrage des stocks : Recherche des niveaux ALERTE et CRITIQUE');
        const stocksEnAlerte = await this.prisma.articleStock.findMany({
            where: {
                niveauAlerte: { in: [client_1.TypeSeuil.CRITIQUE, client_1.TypeSeuil.ALERTE] },
                deletedAt: null,
                article: { deletedAt: null },
                category: { deletedAt: null },
            },
            select: {
                id: true,
                quantiteActuelle: true,
                niveauAlerte: true,
                article: { select: { nom: true } },
                category: { select: { nomUnique: true, prixUnite: true } },
            },
            orderBy: [{ niveauAlerte: 'desc' }, { quantiteActuelle: 'asc' }],
        });
        return stocksEnAlerte.map((s) => ({
            id: s.id,
            quantiteActuelle: s.quantiteActuelle,
            niveauAlerte: s.niveauAlerte,
            nomArticle: s.article.nom,
            format: s.category.nomUnique,
            prixUnite: s.category.prixUnite,
            isUrgent: s.niveauAlerte === client_1.TypeSeuil.CRITIQUE,
            messageLogistique: s.niveauAlerte === client_1.TypeSeuil.CRITIQUE
                ? `🔴 COMMANDE URGENTE : Il ne reste que ${s.quantiteActuelle} unité(s) de ${s.article.nom} (${s.category.nomUnique})`
                : `🟠 Réapprovisionnement conseillé : ${s.quantiteActuelle} restants pour ${s.article.nom}.`,
        }));
    }
    async getMouvementsStock(query) {
        const { articleStockId, page = 1, limit = 10 } = query;
        const isIdValid = typeof articleStockId === 'string' && articleStockId.trim().length > 0;
        const skip = (page - 1) * limit;
        this.logger.log(`📜 Récupération historique - Page: ${page}, Limite: ${limit}`);
        const [total, movements] = await Promise.all([
            this.prisma.movementStock.count({ where: isIdValid ? { articleStockId } : {} }),
            this.prisma.movementStock.findMany({
                where: isIdValid ? { articleStockId } : {},
                select: {
                    id: true,
                    type: true,
                    quantiteSortieOuEntree: true,
                    quantiteAvant: true,
                    quantiteApres: true,
                    motif: true,
                    movementDate: true,
                    isSystem: true,
                    article: { select: { id: true, nom: true } },
                    articleStock: {
                        select: { category: { select: { id: true, nomUnique: true } } },
                    },
                    user: { select: { firstName: true, lastName: true } },
                },
                orderBy: { movementDate: 'desc' },
                skip,
                take: limit,
            }),
        ]);
        const mappedData = movements.map((m) => ({
            id: m.id,
            type: m.type,
            quantite: m.quantiteSortieOuEntree,
            avant: m.quantiteAvant,
            apres: m.quantiteApres,
            motif: m.motif || 'Non disponible',
            date: m.movementDate,
            isSystem: m.isSystem,
            articleId: m.article.id,
            articleNom: m.article?.nom || 'Non disponible',
            categoryId: m.articleStock?.category?.id,
            categoryNom: m.articleStock?.category?.nomUnique || 'Non disponible',
            auteur: m.user ? `${m.user.firstName} ${m.user.lastName}` : 'Système',
        }));
        return {
            data: mappedData,
            meta: {
                totalItems: total,
                itemCount: movements.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        };
    }
    computeNewQuantity(type, actuelle, delta, nom) {
        switch (type) {
            case client_1.TypeMouvement.ENTREE:
                return actuelle + delta;
            case client_1.TypeMouvement.SORTIE:
            case client_1.TypeMouvement.PERTE:
                if (delta > actuelle) {
                    throw new common_1.BadRequestException(`Stock insuffisant pour "${nom}". Dispo: ${actuelle}, Demandé: ${delta}`);
                }
                return actuelle - delta;
            case client_1.TypeMouvement.AJUSTEMENT:
                return delta;
            default:
                throw new common_1.BadRequestException('Type de mouvement inconnu');
        }
    }
    computeNiveauAlerte(quantite, seuilAlerte, seuilCritique) {
        if (quantite <= seuilCritique)
            return client_1.TypeSeuil.CRITIQUE;
        if (quantite <= seuilAlerte)
            return client_1.TypeSeuil.ALERTE;
        return client_1.TypeSeuil.NORMAL;
    }
    buildAlerte(niveau, nomArticle, quantite) {
        if (niveau === client_1.TypeSeuil.NORMAL)
            return { active: false, niveau, message: '' };
        const message = niveau === client_1.TypeSeuil.CRITIQUE
            ? `Stock CRITIQUE pour "${nomArticle}" : ${quantite} unité(s) restante(s). Approvisionnement urgent requis.`
            : `Stock faible pour "${nomArticle}" : ${quantite} unité(s) restante(s). Penser à commander.`;
        return { active: true, niveau, message };
    }
    buildAlerteStock(niveau, nom, quantite) {
        switch (niveau) {
            case 'CRITICAL':
                return { label: 'Critique', color: '#EF4444', message: `Urgent : ${nom} est presque épuisé (${quantite} restant).` };
            case 'LOW':
                return { label: 'Faible', color: '#F59E0B', message: `Attention : Le stock de ${nom} est en dessous du seuil.` };
            default:
                return { label: 'Normal', color: '#10B981', message: 'Niveau de stock satisfaisant.' };
        }
    }
};
exports.StockService = StockService;
exports.StockService = StockService = StockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_log_service_1.CommerceLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], StockService);
//# sourceMappingURL=stock.service.js.map