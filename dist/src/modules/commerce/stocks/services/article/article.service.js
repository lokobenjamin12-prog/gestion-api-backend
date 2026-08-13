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
var ArticleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../../prisma/prisma.service");
const index_1 = require("../../dto/index");
const commerce_log_service_1 = require("../../../log/commerce-log.service");
const stock_realtime_gateway_1 = require("../../../realtime/stock-realtime.gateway");
let ArticleService = ArticleService_1 = class ArticleService {
    prisma;
    commerceLog;
    realtimeGateway;
    logger = new common_1.Logger(ArticleService_1.name);
    constructor(prisma, commerceLog, realtimeGateway) {
        this.prisma = prisma;
        this.commerceLog = commerceLog;
        this.realtimeGateway = realtimeGateway;
    }
    async createSimpleArticle(dto, currentUser) {
        const { nomArticle } = dto;
        const userId = currentUser?.sub;
        this.logger.log(`🏗️ Création de l'article de base : ${nomArticle}`);
        const existing = await this.prisma.article.findUnique({ where: { nom: nomArticle } });
        if (existing) {
            throw new common_1.ConflictException(`L'article "${nomArticle}" existe déjà dans le catalogue.`);
        }
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const article = await tx.article.create({
                    data: { nom: nomArticle },
                });
                await this.commerceLog.info({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'CREATE_SIMPLE_ARTICLE',
                    entityId: article.id,
                    entityName: article.nom,
                    apres: { nom: nomArticle },
                    message: `Nouvel article créé au catalogue : "${nomArticle}"`,
                    state: client_1.State.SUCCESS,
                }, tx);
                return {
                    id: article.id,
                    nom: article.nom,
                    createdAt: article.createdAt,
                    message: 'Article créé avec succès au catalogue. Vous pouvez maintenant y ajouter des formats (ex: Sac, Bouteille).',
                };
            });
            this.realtimeGateway.emitEntityChanged({ module: 'article', action: 'created', id: result.id });
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Erreur création article simple : ${error.message}`);
            if (error instanceof common_1.ConflictException)
                throw error;
            throw new common_1.InternalServerErrorException("Une erreur technique empêche la création de l'article.");
        }
    }
    async createArticleWithCategory(dto, currentUser) {
        const { nom, nomUniqueCategory, prixUnite, description, seuilAlerte, seuilCritique } = dto;
        const userId = currentUser?.sub;
        this.logger.log(`🚀 Tentative de création de l'article : ${nom}`);
        const actorName = await this.commerceLog.resolveActorName(userId);
        let categoryId;
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const article = await tx.article.create({
                    data: {
                        nom,
                        categories: {
                            create: {
                                nomUnique: nomUniqueCategory,
                                prixUnite,
                                description,
                            },
                        },
                    },
                    include: { categories: true },
                });
                const category = article.categories[0];
                categoryId = category.id;
                const stock = await tx.articleStock.create({
                    data: {
                        articleId: article.id,
                        categoryId: category.id,
                        quantiteActuelle: 0,
                        niveauAlerte: client_1.TypeSeuil.CRITIQUE,
                        seuilAlerte,
                        seuilCritique,
                    },
                });
                await tx.movementStock.create({
                    data: {
                        type: 'INITIALISATION',
                        quantiteSortieOuEntree: 0,
                        quantiteAvant: 0,
                        quantiteApres: 0,
                        isSystem: true,
                        movementDate: new Date(),
                        articleId: article.id,
                        articleStockId: stock.id,
                        userId,
                        motif: `Initialisation système : format ${category.nomUnique}`,
                    },
                });
                await this.commerceLog.info({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'CREATE_ARTICLE_FULL',
                    entityId: article.id,
                    entityName: article.nom,
                    apres: { nom, category: category.nomUnique, stockId: stock.id, seuilAlerte, seuilCritique },
                    message: `Article "${nom}" créé avec son format initial "${category.nomUnique}".`,
                    state: client_1.State.SUCCESS,
                }, tx);
                return {
                    id: article.id,
                    message: `Article et format "${category.nomUnique}" créés avec succès.`,
                    stockId: stock.id,
                    articleName: article.nom,
                    categoryName: category.nomUnique,
                };
            });
            this.realtimeGateway.emitEntityChanged({ module: 'article', action: 'created', id: result.id });
            this.realtimeGateway.emitEntityChanged({ module: 'category', action: 'created', id: categoryId });
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Erreur création article : ${error.message}`);
            throw new common_1.InternalServerErrorException("Échec de la création de l'article et de son format.");
        }
    }
    async findAll(query, currentUser) {
        const { page = 1, limit = 10, status = index_1.ArticleStatusFilter.ACTIVE, search } = query;
        const skip = (page - 1) * limit;
        const { sub: userId, email: userEmail } = currentUser;
        this.logger.log(`🔍 Catalogue par ${userEmail} | Filtre: ${status} | Search: ${search || 'aucun'}`);
        try {
            const whereClause = {};
            if (status === index_1.ArticleStatusFilter.ACTIVE)
                whereClause.deletedAt = null;
            if (status === index_1.ArticleStatusFilter.ARCHIVED)
                whereClause.deletedAt = { not: null };
            if (search) {
                whereClause.OR = [
                    { nom: { contains: search, mode: 'insensitive' } },
                    { categories: { some: { nomUnique: { contains: search, mode: 'insensitive' } } } },
                ];
            }
            const [total, articles] = await this.prisma.$transaction([
                this.prisma.article.count({ where: whereClause }),
                this.prisma.article.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    include: { stocks: { include: { category: true } } },
                    orderBy: [{ nom: 'asc' }, { createdAt: 'desc' }],
                }),
            ]);
            const formattedData = articles.map((article) => {
                const aggregate = article.stocks.reduce((acc, s) => {
                    const prix = s.category?.prixUnite;
                    if (prix == null) {
                        throw new Error(`Prix unitaire manquant pour le stock : ${s.id || 'ID inconnu'}`);
                    }
                    return {
                        quantiteTotale: acc.quantiteTotale + s.quantiteActuelle,
                        valeurTotale: acc.valeurTotale + s.quantiteActuelle * prix,
                    };
                }, { quantiteTotale: 0, valeurTotale: 0 });
                return {
                    id: article.id,
                    nom: article.nom,
                    createdAt: article.createdAt,
                    isArchived: article.deletedAt !== null,
                    formats: article.stocks.map((s) => s.category.nomUnique),
                    quantiteTotale: aggregate.quantiteTotale,
                    valeurTotale: aggregate.valeurTotale,
                    enAlerte: article.stocks.some((s) => s.niveauAlerte !== 'NORMAL'),
                };
            });
            this.commerceLog.info({
                actorId: userId,
                actorName: userEmail,
                module: client_1.CommerceModule.STOCK,
                action: 'READ_ARTICLES',
                message: `Consultation catalogue (${status}). ${total} articles trouvés.`,
                state: client_1.State.SUCCESS,
            }).catch((err) => this.logger.error(`Erreur log findAll: ${err.message}`));
            return {
                data: formattedData,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page * limit < total,
                    hasPreviousPage: page > 1,
                },
            };
        }
        catch (error) {
            this.logger.error(`❌ Erreur findAll Article : ${error.message}`);
            throw new common_1.InternalServerErrorException('Erreur lors de la récupération du catalogue.');
        }
    }
    async findOne(id, currentUser) {
        const { sub: userId, email: userEmail } = currentUser;
        this.logger.log(`🔍 Détails Article ID: ${id} par ${userEmail}`);
        if (!userId || !userEmail)
            throw new common_1.UnauthorizedException('Session utilisateur non identifiée.');
        try {
            const article = await this.prisma.article.findUnique({
                where: { id },
                select: {
                    id: true,
                    nom: true,
                    deletedAt: true,
                    createdAt: true,
                    stocks: {
                        where: { deletedAt: null, category: { deletedAt: null } },
                        select: {
                            id: true,
                            quantiteActuelle: true,
                            niveauAlerte: true,
                            category: { select: { id: true, nomUnique: true, prixUnite: true } },
                        },
                    },
                },
            });
            if (!article)
                throw new common_1.NotFoundException(`L'article avec l'ID "${id}" n'existe pas.`);
            const isArchived = article.deletedAt !== null;
            this.commerceLog.info({
                actorId: userId,
                actorName: userEmail,
                module: client_1.CommerceModule.STOCK,
                action: 'READ_ARTICLE_DETAIL',
                entityId: article.id,
                entityName: article.nom,
                message: `Consultation article : ${article.nom} ${isArchived ? '(ARCHIVÉ)' : '(ACTIF)'}`,
                state: client_1.State.SUCCESS,
            }).catch((err) => this.logger.error(`Erreur log findOne: ${err.message}`));
            const detailsStock = article.stocks.map((s) => ({
                stockId: s.id,
                format: s.category.nomUnique,
                prixUnite: s.category.prixUnite,
                quantite: s.quantiteActuelle,
                niveauAlerte: s.niveauAlerte,
                valeurEstimee: s.quantiteActuelle * s.category.prixUnite,
            }));
            return {
                id: article.id,
                nom: article.nom,
                createdAt: article.createdAt,
                isArchived,
                archivedAt: article.deletedAt,
                canMoveStock: !isArchived,
                detailsStock,
                quantiteTotale: article.stocks.reduce((acc, curr) => acc + curr.quantiteActuelle, 0),
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`❌ Erreur technique findOne Article : ${error.message}`);
            throw new common_1.InternalServerErrorException("Erreur technique lors de la récupération des détails de l'article.");
        }
    }
    async getCategoriesByArticle(articleId, query, currentUser) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const { sub: userId, email: userEmail } = currentUser;
        this.logger.log(`🔍 Categories for article #${articleId} | Page: ${page} | By: ${userEmail}`);
        try {
            const [articleExists, total, categories] = await this.prisma.$transaction([
                this.prisma.article.findUnique({ where: { id: articleId }, select: { id: true, nom: true } }),
                this.prisma.category.count({ where: { articleId, deletedAt: null } }),
                this.prisma.category.findMany({
                    where: { articleId, deletedAt: null },
                    select: {
                        id: true,
                        nomUnique: true,
                        prixUnite: true,
                        description: true,
                        createdAt: true,
                        stocks: { select: { quantiteActuelle: true, niveauAlerte: true } },
                    },
                    orderBy: [{ createdAt: 'asc' }],
                    skip,
                    take: limit,
                }),
            ]);
            if (!articleExists)
                throw new common_1.NotFoundException(`Article #${articleId} not found`);
            const formattedCategories = categories.map((cat) => {
                const quantiteTotale = cat.stocks.reduce((acc, s) => acc + s.quantiteActuelle, 0);
                return {
                    id: cat.id,
                    nomUnique: cat.nomUnique,
                    prixUnite: cat.prixUnite,
                    description: cat.description,
                    createdAt: cat.createdAt,
                    quantiteTotale,
                    valeurTotale: quantiteTotale * cat.prixUnite,
                    enAlerte: cat.stocks.some((s) => s.niveauAlerte !== 'NORMAL'),
                };
            });
            this.commerceLog.info({
                actorId: userId,
                actorName: userEmail,
                module: client_1.CommerceModule.STOCK,
                action: 'READ_CATEGORIES_BY_ARTICLE',
                entityId: articleId,
                entityName: articleExists.nom,
                message: `Categories of article "${articleExists.nom}" consulted. ${total} found. Page ${page}/${Math.ceil(total / limit)}.`,
                state: client_1.State.SUCCESS,
            }).catch((err) => this.logger.error(`Erreur log getCategoriesByArticle: ${err.message}`));
            return {
                articleId,
                articleNom: articleExists.nom,
                data: formattedCategories,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page * limit < total,
                    hasPreviousPage: page > 1,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            this.logger.error(`❌ Error getCategoriesByArticle : ${error.message}`);
            throw new common_1.InternalServerErrorException('Error while fetching categories for this article.');
        }
    }
    async update(id, dto, currentUser) {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        const { nom } = dto;
        this.logger.log(`📝 Mise à jour de l'article ID: ${id} par ${userEmail}`);
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const currentArticle = await tx.article.findUnique({ where: { id } });
                if (!currentArticle)
                    throw new common_1.NotFoundException("L'article spécifié n'existe pas.");
                if (currentArticle.deletedAt !== null) {
                    throw new common_1.ForbiddenException('Action refusée : Cet article est archivé. Vous devez le restaurer avant de pouvoir le modifier.');
                }
                const updatedArticle = await tx.article.update({
                    where: { id },
                    data: { nom: nom ?? undefined },
                    include: {
                        stocks: {
                            where: { deletedAt: null, category: { deletedAt: null } },
                            include: { category: true },
                        },
                    },
                });
                await this.commerceLog.info({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'UPDATE_ARTICLE',
                    entityId: id,
                    entityName: updatedArticle.nom,
                    avant: { nom: currentArticle.nom },
                    apres: { nom: updatedArticle.nom },
                    message: `Mise à jour article "${currentArticle.nom}" → "${updatedArticle.nom}"`,
                    state: client_1.State.SUCCESS,
                }, tx);
                this.logger.log(`✅ Article "${updatedArticle.nom}" mis à jour avec succès.`);
                return {
                    id: updatedArticle.id,
                    nom: updatedArticle.nom,
                    updatedAt: updatedArticle.updatedAt,
                    message: "L'article a été mis à jour avec succès.",
                };
            });
            this.realtimeGateway.emitEntityChanged({ module: 'article', action: 'updated', id });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`❌ Échec technique update article ${id} : ${error.message}`);
            throw new common_1.InternalServerErrorException("Une erreur technique empêche la mise à jour de l'article.");
        }
    }
    async softDeleteArticle(id, currentUser) {
        const userId = currentUser?.sub;
        const actorName = await this.commerceLog.resolveActorName(userId);
        const result = await this.prisma.$transaction(async (tx) => {
            const article = await tx.article.findUnique({
                where: { id },
                include: { stocks: true },
            });
            if (!article)
                throw new common_1.NotFoundException('Article introuvable.');
            const stockTotal = article.stocks.reduce((acc, s) => acc + s.quantiteActuelle, 0);
            if (stockTotal > 0) {
                throw new common_1.ForbiddenException(`Impossible de supprimer l'article : il reste ${stockTotal} unités en stock.`);
            }
            const now = new Date();
            await tx.articleStock.updateMany({ where: { articleId: id }, data: { deletedAt: now } });
            await tx.category.updateMany({ where: { articleId: id }, data: { deletedAt: now } });
            const deletedArticle = await tx.article.update({
                where: { id },
                data: { deletedAt: now },
            });
            await this.commerceLog.warn({
                actorId: userId,
                actorName,
                module: client_1.CommerceModule.STOCK,
                action: 'SOFT_DELETE_ARTICLE',
                entityId: id,
                entityName: article.nom,
                avant: { deletedAt: null },
                apres: { deletedAt: now },
                message: `L'article "${article.nom}" et tous ses formats ont été archivés.`,
                state: client_1.State.SUCCESS,
            }, tx);
            return {
                id: deletedArticle.id,
                message: `L'article "${article.nom}" et ses dépendances ont été archivés.`,
                deletedAt: now,
            };
        });
        this.realtimeGateway.emitEntityChanged({ module: 'article', action: 'deleted', id });
        return result;
    }
    async restoreArticle(id, currentUser) {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        this.logger.log(`♻️ Tentative de restauration de l'article ID: ${id} par ${userEmail}`);
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const article = await tx.article.findUnique({
                    where: { id },
                    select: { id: true, nom: true, deletedAt: true },
                });
                if (!article)
                    throw new common_1.NotFoundException('Article introuvable.');
                if (article.deletedAt === null)
                    throw new common_1.BadRequestException('Cet article est déjà actif.');
                await tx.articleStock.updateMany({ where: { articleId: id }, data: { deletedAt: null } });
                await tx.category.updateMany({ where: { articleId: id }, data: { deletedAt: null } });
                const restoredArticle = await tx.article.update({
                    where: { id },
                    data: { deletedAt: null },
                    include: { stocks: { include: { category: true } } },
                });
                await this.commerceLog.info({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'RESTORE_ARTICLE',
                    entityId: id,
                    entityName: restoredArticle.nom,
                    avant: { deletedAt: article.deletedAt },
                    apres: { deletedAt: null },
                    message: `L'article "${restoredArticle.nom}" et tous ses formats ont été restaurés.`,
                    state: client_1.State.SUCCESS,
                }, tx);
                this.logger.log(`✅ Article "${restoredArticle.nom}" restauré avec succès.`);
                return {
                    id: restoredArticle.id,
                    nom: restoredArticle.nom,
                    message: 'Article et formats associés restaurés avec succès.',
                    restoredAt: new Date(),
                };
            });
            this.realtimeGateway.emitEntityChanged({ module: 'article', action: 'restored', id });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`❌ Erreur restauration article : ${error.message}`);
            throw new common_1.InternalServerErrorException("Échec de la restauration de l'article.");
        }
    }
    async hardDeleteArticle(id, currentUser) {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        this.logger.warn(`⚠️ SUPPRESSION DÉFINITIVE : Article ID ${id} par ${userEmail}`);
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const article = await tx.article.findUnique({
                    where: { id },
                    include: {
                        _count: { select: { mouvements: { where: { isSystem: false } } } },
                    },
                });
                if (!article)
                    throw new common_1.NotFoundException('Article introuvable.');
                if (article._count.mouvements > 0) {
                    throw new common_1.ForbiddenException('Suppression définitive impossible : cet article possède un historique de mouvements réels. Utilisez le Soft Delete (archivage) à la place.');
                }
                await tx.article.delete({ where: { id } });
                await this.commerceLog.warn({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'HARD_DELETE_ARTICLE',
                    entityId: id,
                    entityName: article.nom,
                    avant: { nom: article.nom, id },
                    message: `L'article "${article.nom}" (ID: ${id}) a été supprimé définitivement.`,
                    state: client_1.State.SUCCESS,
                }, tx);
                this.logger.log(`🗑️ Article "${article.nom}" supprimé définitivement.`);
                return {
                    deletedId: id,
                    articleName: article.nom,
                    message: "L'article et toutes ses données liées ont été supprimés définitivement.",
                    timestamp: new Date(),
                };
            });
            this.realtimeGateway.emitEntityChanged({ module: 'article', action: 'deleted', id });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`❌ Erreur hardDelete article : ${error.message}`);
            throw new common_1.InternalServerErrorException('Échec de la suppression définitive.');
        }
    }
};
exports.ArticleService = ArticleService;
exports.ArticleService = ArticleService = ArticleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_log_service_1.CommerceLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], ArticleService);
//# sourceMappingURL=article.service.js.map