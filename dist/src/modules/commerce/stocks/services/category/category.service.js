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
var CategoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const commerce_log_service_1 = require("../../../log/commerce-log.service");
const stock_realtime_gateway_1 = require("../../../realtime/stock-realtime.gateway");
let CategoryService = CategoryService_1 = class CategoryService {
    prisma;
    commerceLog;
    realtimeGateway;
    logger = new common_1.Logger(CategoryService_1.name);
    constructor(prisma, commerceLog, realtimeGateway) {
        this.prisma = prisma;
        this.commerceLog = commerceLog;
        this.realtimeGateway = realtimeGateway;
    }
    async create(dto, currentUser) {
        const { nomUnique, articleId, description, prixUnite, seuilAlerte, seuilCritique } = dto;
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        this.logger.log(`🚀 Création du format "${nomUnique}" pour l'article ID: ${articleId}`);
        const parentArticle = await this.prisma.article.findUnique({ where: { id: articleId } });
        if (!parentArticle)
            throw new common_1.NotFoundException('Article parent introuvable.');
        if (parentArticle.deletedAt)
            throw new common_1.ForbiddenException("Impossible d'ajouter un format à un article archivé.");
        const existing = await this.prisma.category.findFirst({ where: { nomUnique, articleId } });
        if (existing) {
            if (existing.deletedAt !== null) {
                throw new common_1.ConflictException(`Le format "${nomUnique}" est archivé pour cet article. Restaurez-le.`);
            }
            throw new common_1.ConflictException(`Le format "${nomUnique}" existe déjà pour cet article.`);
        }
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const category = await tx.category.create({
                    data: { nomUnique, articleId, description, prixUnite, deletedAt: null },
                });
                const newStock = await tx.articleStock.create({
                    data: {
                        articleId,
                        categoryId: category.id,
                        quantiteActuelle: 0,
                        niveauAlerte: client_1.TypeSeuil.CRITIQUE,
                        seuilAlerte,
                        seuilCritique,
                        deletedAt: null,
                    },
                });
                await tx.movementStock.create({
                    data: {
                        articleStockId: newStock.id,
                        articleId,
                        type: 'INITIALISATION',
                        quantiteSortieOuEntree: 0,
                        quantiteAvant: 0,
                        quantiteApres: 0,
                        motif: `Initialisation format : ${nomUnique}`,
                        isSystem: true,
                        movementDate: new Date(),
                        userId,
                    },
                });
                await this.commerceLog.info({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'CREATE_CATEGORY_WITH_STOCK',
                    entityId: category.id,
                    entityName: category.nomUnique,
                    apres: { nomUnique, articleId, stockId: newStock.id, seuilAlerte, seuilCritique },
                    message: `Format "${category.nomUnique}" créé pour l'article "${parentArticle.nom}". Description: ${description || 'N/A'}`,
                    state: client_1.State.SUCCESS,
                }, tx);
                return {
                    id: category.id,
                    nomUnique: category.nomUnique,
                    articleId: category.articleId,
                    stockId: newStock.id,
                    message: `Le format "${nomUnique}" a été créé et initialisé avec succès.`,
                };
            });
            this.realtimeGateway.emitEntityChanged({ module: 'category', action: 'created', id: result.id });
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Échec de la création : ${error.message}`);
            this.commerceLog.warn({
                actorId: userId,
                actorName,
                module: client_1.CommerceModule.STOCK,
                action: 'CREATE_CATEGORY_ERROR',
                message: `Tentative échouée pour "${nomUnique}". Raison : ${error.message}`,
                state: client_1.State.FAILED,
            }).catch(() => { });
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.InternalServerErrorException('Erreur technique lors de la création du format.');
        }
    }
    async findAll(query, currentUser) {
        const { page = 1, limit = 10, articleId, search } = query;
        const skip = (page - 1) * limit;
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        this.logger.log(`🔍 Récupération des formats par ${userEmail} | Search: ${search || 'aucun'}`);
        try {
            const whereClause = {
                deletedAt: null,
                ...(articleId && { articleId }),
                ...(search && { nomUnique: { contains: search, mode: 'insensitive' } }),
            };
            const [total, categories] = await this.prisma.$transaction([
                this.prisma.category.count({ where: whereClause }),
                this.prisma.category.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        nomUnique: true,
                        prixUnite: true,
                        description: true,
                        article: { select: { id: true, nom: true } },
                        stocks: {
                            where: { deletedAt: null },
                            select: { quantiteActuelle: true, niveauAlerte: true },
                        },
                    },
                    orderBy: [
                        { article: { nom: 'asc' } },
                        { nomUnique: 'asc' },
                        { createdAt: 'desc' },
                    ],
                }),
            ]);
            this.commerceLog.info({
                actorId: userId,
                actorName: userEmail,
                module: client_1.CommerceModule.STOCK,
                action: 'READ_CATEGORIES_PAGINATED',
                message: `Consultation catalogue : ${categories.length} formats récupérés.`,
                state: client_1.State.SUCCESS,
            }).catch((err) => this.logger.error(`Erreur log findAll: ${err.message}`));
            return {
                data: categories.map((c) => ({
                    ...c,
                    quantiteDisponible: c.stocks[0]?.quantiteActuelle ?? 0,
                    alerte: c.stocks[0]?.niveauAlerte ?? 'NORMAL',
                })),
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
            this.logger.error(`❌ Erreur lecture catégories : ${error.message}`);
            throw new common_1.InternalServerErrorException('Erreur lors du chargement des formats.');
        }
    }
    async findOne(id, currentUser) {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        this.logger.log(`🔍 Recherche détaillée du format ID: ${id}`);
        if (!userId || !userEmail)
            throw new common_1.UnauthorizedException('Session utilisateur non identifiée.');
        try {
            const category = await this.prisma.category.findUnique({
                where: { id },
                select: {
                    id: true,
                    nomUnique: true,
                    prixUnite: true,
                    description: true,
                    deletedAt: true,
                    articleId: true,
                    article: { select: { nom: true } },
                    stocks: {
                        where: { deletedAt: null },
                        select: { id: true, quantiteActuelle: true, niveauAlerte: true },
                    },
                },
            });
            if (!category)
                throw new common_1.NotFoundException("Le format spécifié n'existe pas.");
            if (category.deletedAt !== null) {
                throw new common_1.GoneException(`Le format "${category.nomUnique}" a été archivé et ne peut plus être consulté.`);
            }
            const result = {
                id: category.id,
                nomFormat: category.nomUnique,
                description: category.description,
                prixUnite: category.prixUnite,
                article: category.article,
                stock: category.stocks[0] || null,
            };
            this.commerceLog.info({
                actorId: userId,
                actorName: userEmail,
                module: client_1.CommerceModule.STOCK,
                action: 'READ_CATEGORY_DETAIL',
                entityId: category.id,
                entityName: category.nomUnique,
                message: `Détails consultés : ${category.article.nom} (${category.nomUnique})`,
                state: client_1.State.SUCCESS,
            }).catch((err) => this.logger.error(`Erreur log findOne: ${err.message}`));
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`❌ Erreur findOne : ${error.message}`);
            throw new common_1.InternalServerErrorException('Erreur lors de la récupération des détails.');
        }
    }
    async update(id, updateCategoryDto, currentUser) {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        this.logger.log(`📝 Mise à jour du format ID: ${id}`);
        const existingCategory = await this.prisma.category.findUnique({ where: { id } });
        if (!existingCategory)
            throw new common_1.NotFoundException(`Le format avec l'ID "${id}" n'existe pas.`);
        const { nomUnique } = updateCategoryDto;
        if (nomUnique && nomUnique !== existingCategory.nomUnique) {
            const duplicate = await this.prisma.category.findFirst({
                where: { nomUnique, articleId: existingCategory.articleId, NOT: { id } },
            });
            if (duplicate)
                throw new common_1.ConflictException(`Le format "${nomUnique}" existe déjà pour cet article.`);
        }
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const updatedCategory = await tx.category.update({
                    where: { id },
                    data: updateCategoryDto,
                });
                await this.commerceLog.info({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'UPDATE_CATEGORY',
                    entityId: id,
                    entityName: updatedCategory.nomUnique,
                    avant: { nomUnique: existingCategory.nomUnique, prixUnite: existingCategory.prixUnite },
                    apres: { nomUnique: updatedCategory.nomUnique, prixUnite: updatedCategory.prixUnite },
                    message: `Format modifié : ${existingCategory.nomUnique} → ${updatedCategory.nomUnique} (Prix: ${updatedCategory.prixUnite} FCFA)`,
                    state: client_1.State.SUCCESS,
                }, tx);
                this.logger.log(`✅ Format "${updatedCategory.nomUnique}" mis à jour.`);
                return {
                    id: updatedCategory.id,
                    nomUnique: updatedCategory.nomUnique,
                    prixUnite: updatedCategory.prixUnite,
                    message: 'Format mis à jour avec succès.',
                    updatedAt: updatedCategory.updatedAt,
                };
            });
            console.log('[DEBUG emit-category] émission entity.changed pour category', id);
            this.realtimeGateway.emitEntityChanged({ module: 'category', action: 'updated', id });
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Échec update catégorie ${id} : ${error.message}`);
            this.commerceLog.warn({
                actorId: userId,
                actorName,
                module: client_1.CommerceModule.STOCK,
                action: 'UPDATE_CATEGORY_ERROR',
                message: `Erreur lors de l'update du format : ${existingCategory.nomUnique}`,
                state: client_1.State.FAILED,
            }).catch(() => { });
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.InternalServerErrorException('Erreur lors de la mise à jour.');
        }
    }
    async softDelete(id, currentUser) {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        this.logger.log(`⚠️ Tentative d'archivage du format ID: ${id}`);
        if (!userId || !userEmail)
            throw new common_1.UnauthorizedException('Session invalide.');
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException("Le format spécifié n'existe pas.");
        if (category.deletedAt !== null) {
            throw new common_1.ConflictException(`Le format "${category.nomUnique}" est déjà archivé.`);
        }
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const now = new Date();
                await tx.category.update({ where: { id }, data: { deletedAt: now } });
                await tx.articleStock.updateMany({
                    where: { categoryId: id, deletedAt: null },
                    data: { deletedAt: now },
                });
                await this.commerceLog.warn({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'SOFT_DELETE_CATEGORY',
                    entityId: id,
                    entityName: category.nomUnique,
                    avant: { deletedAt: null },
                    apres: { deletedAt: now },
                    message: `Archivage du format "${category.nomUnique}". Le stock associé a également été masqué.`,
                    state: client_1.State.SUCCESS,
                }, tx);
                this.logger.log(`✅ Format "${category.nomUnique}" et son stock archivés.`);
                return {
                    id: category.id,
                    nomUnique: category.nomUnique,
                    message: 'Le format et son stock associé ont été archivés avec succès.',
                    archivedAt: now,
                };
            });
            this.realtimeGateway.emitEntityChanged({ module: 'category', action: 'deleted', id });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`❌ Échec soft-delete format ${id} : ${error.message}`);
            this.commerceLog.warn({
                actorId: userId,
                actorName,
                module: client_1.CommerceModule.STOCK,
                action: 'SOFT_DELETE_CATEGORY_ERROR',
                message: `Erreur lors de l'archivage du format ID: ${id}`,
                state: client_1.State.FAILED,
            }).catch(() => { });
            throw new common_1.InternalServerErrorException("Erreur technique lors de l'archivage.");
        }
    }
    async restore(id, currentUser) {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        this.logger.log(`♻️ Tentative de restauration du format ID: ${id}`);
        if (!userId || !userEmail)
            throw new common_1.UnauthorizedException('Session invalide.');
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { article: true },
        });
        if (!category)
            throw new common_1.NotFoundException("Ce format n'existe pas.");
        if (category.deletedAt === null) {
            throw new common_1.BadRequestException(`Le format "${category.nomUnique}" est déjà actif.`);
        }
        if (category.article.deletedAt !== null) {
            throw new common_1.ForbiddenException(`Impossible de restaurer ce format car l'article parent "${category.article.nom}" est archivé. Restaurez d'abord l'article.`);
        }
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const restoredCategory = await tx.category.update({
                    where: { id },
                    data: { deletedAt: null },
                });
                await tx.articleStock.updateMany({
                    where: { categoryId: id, articleId: category.articleId },
                    data: { deletedAt: null },
                });
                await this.commerceLog.info({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'RESTORE_CATEGORY',
                    entityId: id,
                    entityName: category.nomUnique,
                    avant: { deletedAt: category.deletedAt },
                    apres: { deletedAt: null },
                    message: `Restauration réussie du format "${category.nomUnique}" pour l'article "${category.article.nom}".`,
                    state: client_1.State.SUCCESS,
                }, tx);
                this.logger.log(`✅ Format "${category.nomUnique}" restauré.`);
                return {
                    id: restoredCategory.id,
                    nomUnique: restoredCategory.nomUnique,
                    articleNom: category.article.nom,
                    message: `Le format "${category.nomUnique}" a été réactivé avec succès.`,
                };
            });
            this.realtimeGateway.emitEntityChanged({ module: 'category', action: 'restored', id });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`❌ Échec restauration format ${id} : ${error.message}`);
            this.commerceLog.warn({
                actorId: userId,
                actorName,
                module: client_1.CommerceModule.STOCK,
                action: 'RESTORE_CATEGORY_ERROR',
                message: `Erreur lors de la restauration du format ID: ${id}`,
                state: client_1.State.FAILED,
            }).catch(() => { });
            throw new common_1.InternalServerErrorException('Erreur technique lors de la restauration.');
        }
    }
    async remove(id, currentUser) {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        this.logger.log(`🗑️ Tentative de suppression DÉFINITIVE du format ID: ${id}`);
        if (!userId || !userEmail)
            throw new common_1.UnauthorizedException('Session invalide.');
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                article: true,
                stocks: { include: { _count: { select: { mouvements: true } } } },
            },
        });
        if (!category)
            throw new common_1.NotFoundException("Le format spécifié n'existe pas.");
        const stockId = category.stocks[0]?.id;
        if (stockId) {
            const realMovementsCount = await this.prisma.movementStock.count({
                where: { articleStockId: stockId, isSystem: false },
            });
            if (realMovementsCount > 0) {
                throw new common_1.ForbiddenException(`Suppression impossible : ce format possède ${realMovementsCount} mouvements de stock réels. Utilisez l'archivage (Soft Delete) à la place.`);
            }
        }
        const actorName = await this.commerceLog.resolveActorName(userId);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                if (stockId) {
                    await tx.movementStock.deleteMany({ where: { articleStockId: stockId } });
                    await tx.articleStock.delete({ where: { id: stockId } });
                }
                await tx.category.delete({ where: { id } });
                await this.commerceLog.warn({
                    actorId: userId,
                    actorName,
                    module: client_1.CommerceModule.STOCK,
                    action: 'HARD_DELETE_CATEGORY',
                    entityId: id,
                    entityName: category.nomUnique,
                    avant: { nomUnique: category.nomUnique, articleNom: category.article?.nom },
                    message: `Suppression définitive du format "${category.nomUnique}" de l'article "${category.article?.nom}".`,
                    state: client_1.State.SUCCESS,
                }, tx);
                this.logger.log(`✅ Format "${category.nomUnique}" supprimé définitivement.`);
                return {
                    id: category.id,
                    nomUnique: category.nomUnique,
                    articleNom: category.article?.nom || 'Inconnu',
                    message: 'Le format a été supprimé définitivement du système.',
                    deletedAt: new Date(),
                };
            });
            this.realtimeGateway.emitEntityChanged({ module: 'category', action: 'deleted', id });
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Échec hard-delete format ${id} : ${error.message}`);
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.InternalServerErrorException('Erreur technique lors de la suppression définitive.');
        }
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = CategoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_log_service_1.CommerceLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], CategoryService);
//# sourceMappingURL=category.service.js.map