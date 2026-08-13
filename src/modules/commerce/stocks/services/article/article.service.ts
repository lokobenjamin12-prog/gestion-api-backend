

import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    GoneException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CommerceModule, LogLevel, Prisma, State, TypeMouvement, TypeSeuil } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    ArticleStatusFilter,
    GetArticlesQueryDto,
    CreateSimpleArticleDto,
    CreateArticleDto,
    UpdateArticleDto,
    CreateArticleResponseDto,
    GetArticlesResponseDto,
    ArticleDetailResponseDto,
    UpdateArticleResponseDto,
    CreateSimpleArticleResponseDto,
    DeleteArticleResponseDto,
    RestoreArticleResponseDto,
    HardDeleteResponseDto,
    StockDetailItem,
} from '../../dto/index';
import { GetCategoriesByArticleQueryDto } from '../../dto/request/get-categories-by-categoryId-query.dto';
import { CommerceLogService } from '../../../log/commerce-log.service';
import { StockRealtimeGateway } from '../../../realtime/stock-realtime.gateway';

@Injectable()
export class ArticleService {
    private readonly logger = new Logger(ArticleService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly commerceLog: CommerceLogService,
        private readonly realtimeGateway: StockRealtimeGateway,
    ) { }

    // ─── CREATE SIMPLE ARTICLE ────────────────────────────────────────────────
    async createSimpleArticle(
        dto: CreateSimpleArticleDto,
        currentUser: any,
    ): Promise<CreateSimpleArticleResponseDto> {
        const { nomArticle } = dto;
        const userId = currentUser?.sub;

        this.logger.log(`🏗️ Création de l'article de base : ${nomArticle}`);

        const existing = await this.prisma.article.findUnique({ where: { nom: nomArticle } });
        if (existing) {
            throw new ConflictException(`L'article "${nomArticle}" existe déjà dans le catalogue.`);
        }

        const actorName = await this.commerceLog.resolveActorName(userId);

        try {
            const result = await this.prisma.$transaction(async (tx): Promise<CreateSimpleArticleResponseDto> => {
                const article = await tx.article.create({
                    data: { nom: nomArticle },
                });

                await this.commerceLog.info({
                    actorId: userId,
                    actorName,
                    module: CommerceModule.STOCK,
                    action: 'CREATE_SIMPLE_ARTICLE',
                    entityId: article.id,
                    entityName: article.nom,
                    apres: { nom: nomArticle },
                    message: `Nouvel article créé au catalogue : "${nomArticle}"`,
                    state: State.SUCCESS,
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
        } catch (error) {
            this.logger.error(`❌ Erreur création article simple : ${error.message}`);
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException("Une erreur technique empêche la création de l'article.");
        }
    }

    // ─── CREATE ARTICLE WITH CATEGORY ─────────────────────────────────────────
    async createArticleWithCategory(
        dto: CreateArticleDto,
        currentUser: any,
    ): Promise<CreateArticleResponseDto> {
        const { nom, nomUniqueCategory, prixUnite, description, seuilAlerte, seuilCritique } = dto;
        const userId = currentUser?.sub;

        this.logger.log(`🚀 Tentative de création de l'article : ${nom}`);

        const actorName = await this.commerceLog.resolveActorName(userId);

        let categoryId!: string;

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
                        niveauAlerte: TypeSeuil.CRITIQUE,
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
                    module: CommerceModule.STOCK,
                    action: 'CREATE_ARTICLE_FULL',
                    entityId: article.id,
                    entityName: article.nom,
                    apres: { nom, category: category.nomUnique, stockId: stock.id, seuilAlerte, seuilCritique },
                    message: `Article "${nom}" créé avec son format initial "${category.nomUnique}".`,
                    state: State.SUCCESS,
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
        } catch (error) {
            this.logger.error(`❌ Erreur création article : ${error.message}`);
            throw new InternalServerErrorException("Échec de la création de l'article et de son format.");
        }
    }

    // ─── FIND ALL ─────────────────────────────────────────────────────────────
    async findAll(
        query: GetArticlesQueryDto,
        currentUser: any,
    ): Promise<GetArticlesResponseDto> {
        const { page = 1, limit = 10, status = ArticleStatusFilter.ACTIVE, search } = query;
        const skip = (page - 1) * limit;
        const { sub: userId, email: userEmail } = currentUser;

        this.logger.log(`🔍 Catalogue par ${userEmail} | Filtre: ${status} | Search: ${search || 'aucun'}`);

        try {
            const whereClause: Prisma.ArticleWhereInput = {};

            if (status === ArticleStatusFilter.ACTIVE) whereClause.deletedAt = null;
            if (status === ArticleStatusFilter.ARCHIVED) whereClause.deletedAt = { not: null };

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
                const aggregate = article.stocks.reduce(
                    (acc, s) => {
                        const prix = s.category?.prixUnite;
                        if (prix == null) {
                            throw new Error(`Prix unitaire manquant pour le stock : ${s.id || 'ID inconnu'}`);
                        }
                        return {
                            quantiteTotale: acc.quantiteTotale + s.quantiteActuelle,
                            valeurTotale: acc.valeurTotale + s.quantiteActuelle * prix,
                        };
                    },
                    { quantiteTotale: 0, valeurTotale: 0 },
                );

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

            // Non-blocking
            this.commerceLog.info({
                actorId: userId,
                actorName: userEmail,
                module: CommerceModule.STOCK,
                action: 'READ_ARTICLES',
                message: `Consultation catalogue (${status}). ${total} articles trouvés.`,
                state: State.SUCCESS,
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

        } catch (error) {
            this.logger.error(`❌ Erreur findAll Article : ${error.message}`);
            throw new InternalServerErrorException('Erreur lors de la récupération du catalogue.');
        }
    }

    // ─── FIND ONE ─────────────────────────────────────────────────────────────
    async findOne(id: string, currentUser: any): Promise<ArticleDetailResponseDto> {
        const { sub: userId, email: userEmail } = currentUser;

        this.logger.log(`🔍 Détails Article ID: ${id} par ${userEmail}`);

        if (!userId || !userEmail) throw new UnauthorizedException('Session utilisateur non identifiée.');

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

            if (!article) throw new NotFoundException(`L'article avec l'ID "${id}" n'existe pas.`);

            const isArchived = article.deletedAt !== null;

            // Non-blocking
            this.commerceLog.info({
                actorId: userId,
                actorName: userEmail,
                module: CommerceModule.STOCK,
                action: 'READ_ARTICLE_DETAIL',
                entityId: article.id,
                entityName: article.nom,
                message: `Consultation article : ${article.nom} ${isArchived ? '(ARCHIVÉ)' : '(ACTIF)'}`,
                state: State.SUCCESS,
            }).catch((err) => this.logger.error(`Erreur log findOne: ${err.message}`));

            const detailsStock: StockDetailItem[] = article.stocks.map((s) => ({
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

        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`❌ Erreur technique findOne Article : ${error.message}`);
            throw new InternalServerErrorException("Erreur technique lors de la récupération des détails de l'article.");
        }
    }

    // ─── GET CATEGORIES BY ARTICLE ────────────────────────────────────────────
    async getCategoriesByArticle(
        articleId: string,
        query: GetCategoriesByArticleQueryDto,
        currentUser: any,
    ): Promise<any> {
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

            if (!articleExists) throw new NotFoundException(`Article #${articleId} not found`);

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

            // Non-blocking
            this.commerceLog.info({
                actorId: userId,
                actorName: userEmail,
                module: CommerceModule.STOCK,
                action: 'READ_CATEGORIES_BY_ARTICLE',
                entityId: articleId,
                entityName: articleExists.nom,
                message: `Categories of article "${articleExists.nom}" consulted. ${total} found. Page ${page}/${Math.ceil(total / limit)}.`,
                state: State.SUCCESS,
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

        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`❌ Error getCategoriesByArticle : ${error.message}`);
            throw new InternalServerErrorException('Error while fetching categories for this article.');
        }
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    async update(
        id: string,
        dto: UpdateArticleDto,
        currentUser: any,
    ): Promise<UpdateArticleResponseDto> {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;
        const { nom } = dto;

        this.logger.log(`📝 Mise à jour de l'article ID: ${id} par ${userEmail}`);

        const actorName = await this.commerceLog.resolveActorName(userId);

        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const currentArticle = await tx.article.findUnique({ where: { id } });

                if (!currentArticle) throw new NotFoundException("L'article spécifié n'existe pas.");
                if (currentArticle.deletedAt !== null) {
                    throw new ForbiddenException(
                        'Action refusée : Cet article est archivé. Vous devez le restaurer avant de pouvoir le modifier.',
                    );
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
                    module: CommerceModule.STOCK,
                    action: 'UPDATE_ARTICLE',
                    entityId: id,
                    entityName: updatedArticle.nom,
                    avant: { nom: currentArticle.nom },
                    apres: { nom: updatedArticle.nom },
                    message: `Mise à jour article "${currentArticle.nom}" → "${updatedArticle.nom}"`,
                    state: State.SUCCESS,
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

        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`❌ Échec technique update article ${id} : ${error.message}`);
            throw new InternalServerErrorException("Une erreur technique empêche la mise à jour de l'article.");
        }
    }

    // ─── SOFT DELETE ──────────────────────────────────────────────────────────
    async softDeleteArticle(id: string, currentUser: any): Promise<DeleteArticleResponseDto> {
        const userId = currentUser?.sub;

        const actorName = await this.commerceLog.resolveActorName(userId);

        const result = await this.prisma.$transaction(async (tx): Promise<DeleteArticleResponseDto> => {
            const article = await tx.article.findUnique({
                where: { id },
                include: { stocks: true },
            });

            if (!article) throw new NotFoundException('Article introuvable.');

            const stockTotal = article.stocks.reduce((acc, s) => acc + s.quantiteActuelle, 0);
            if (stockTotal > 0) {
                throw new ForbiddenException(
                    `Impossible de supprimer l'article : il reste ${stockTotal} unités en stock.`,
                );
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
                module: CommerceModule.STOCK,
                action: 'SOFT_DELETE_ARTICLE',
                entityId: id,
                entityName: article.nom,
                avant: { deletedAt: null },
                apres: { deletedAt: now },
                message: `L'article "${article.nom}" et tous ses formats ont été archivés.`,
                state: State.SUCCESS,
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

    // ─── RESTORE ──────────────────────────────────────────────────────────────
    async restoreArticle(id: string, currentUser: any): Promise<RestoreArticleResponseDto> {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;

        this.logger.log(`♻️ Tentative de restauration de l'article ID: ${id} par ${userEmail}`);

        const actorName = await this.commerceLog.resolveActorName(userId);

        try {
            const result = await this.prisma.$transaction(async (tx): Promise<RestoreArticleResponseDto> => {
                const article = await tx.article.findUnique({
                    where: { id },
                    select: { id: true, nom: true, deletedAt: true },
                });

                if (!article) throw new NotFoundException('Article introuvable.');
                if (article.deletedAt === null) throw new BadRequestException('Cet article est déjà actif.');

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
                    module: CommerceModule.STOCK,
                    action: 'RESTORE_ARTICLE',
                    entityId: id,
                    entityName: restoredArticle.nom,
                    avant: { deletedAt: article.deletedAt },
                    apres: { deletedAt: null },
                    message: `L'article "${restoredArticle.nom}" et tous ses formats ont été restaurés.`,
                    state: State.SUCCESS,
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

        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`❌ Erreur restauration article : ${error.message}`);
            throw new InternalServerErrorException("Échec de la restauration de l'article.");
        }
    }

    // ─── HARD DELETE ──────────────────────────────────────────────────────────
    async hardDeleteArticle(id: string, currentUser: any): Promise<HardDeleteResponseDto> {
        const userId = currentUser?.sub;
        const userEmail = currentUser?.email;

        this.logger.warn(`⚠️ SUPPRESSION DÉFINITIVE : Article ID ${id} par ${userEmail}`);

        const actorName = await this.commerceLog.resolveActorName(userId);

        try {
            const result = await this.prisma.$transaction(async (tx): Promise<HardDeleteResponseDto> => {
                const article = await tx.article.findUnique({
                    where: { id },
                    include: {
                        _count: { select: { mouvements: { where: { isSystem: false } } } },
                    },
                });

                if (!article) throw new NotFoundException('Article introuvable.');

                if (article._count.mouvements > 0) {
                    throw new ForbiddenException(
                        'Suppression définitive impossible : cet article possède un historique de mouvements réels. Utilisez le Soft Delete (archivage) à la place.',
                    );
                }

                await tx.article.delete({ where: { id } });

                await this.commerceLog.warn({
                    actorId: userId,
                    actorName,
                    module: CommerceModule.STOCK,
                    action: 'HARD_DELETE_ARTICLE',
                    entityId: id,
                    entityName: article.nom,
                    avant: { nom: article.nom, id },
                    message: `L'article "${article.nom}" (ID: ${id}) a été supprimé définitivement.`,
                    state: State.SUCCESS,
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

        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`❌ Erreur hardDelete article : ${error.message}`);
            throw new InternalServerErrorException('Échec de la suppression définitive.');
        }
    }
}





























// import { BadRequestException, ConflictException, ForbiddenException, GoneException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
// import { AuditModule, LogLevel, Prisma, State, TypeMouvement, TypeSeuil } from '@prisma/client';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { ArticleStatusFilter, GetArticlesQueryDto, CreateSimpleArticleDto, CreateArticleDto, UpdateArticleDto, CreateArticleResponseDto, GetArticlesResponseDto, ArticleDetailResponseDto, UpdateArticleResponseDto, CreateSimpleArticleResponseDto, DeleteArticleResponseDto, RestoreArticleResponseDto, HardDeleteResponseDto, StockDetailItem } from '../../dto/index';
// import { GetCategoriesByArticleQueryDto } from '../../dto/request/get-categories-by-categoryId-query.dto';
// import { AuditService } from 'src/modules/admin/audit/services/audit.service';







// @Injectable()
// export class ArticleService {
//     constructor(
//         private readonly prisma: PrismaService,
//         private readonly audit: AuditService, // ← logService replaced
//     ) { }

//     private readonly STOCK_MODULE = 'STOCK_MODULE';
//     private readonly logger = new Logger(ArticleService.name);

//     // ─── CREATE SIMPLE ARTICLE ────────────────────────────────────────────────
//     async createSimpleArticle(
//         dto: CreateSimpleArticleDto,
//         currentUser: any,
//     ): Promise<CreateSimpleArticleResponseDto> {
//         const { nomArticle } = dto;
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         this.logger.log(`🏗️ Création de l'article de base : ${nomArticle}`);

//         const existing = await this.prisma.article.findUnique({ where: { nom: nomArticle } });
//         if (existing) {
//             throw new ConflictException(`L'article "${nomArticle}" existe déjà dans le catalogue.`);
//         }

//         const actorName = await this.audit.resolveActorName(userId);

//         try {
//             return this.prisma.$transaction(async (tx): Promise<CreateSimpleArticleResponseDto> => {
//                 const article = await tx.article.create({
//                     data: { nom: nomArticle },
//                 });

//                 await this.audit.log({
//                     actorId: userId,
//                     actorName,
//                     module: AuditModule.DEPARTMENT,
//                     action: 'CREATE_SIMPLE_ARTICLE',
//                     level: LogLevel.INFO,
//                     entityId: article.id,
//                     entityName: article.nom,
//                     apres: { nom: nomArticle },
//                     message: `Nouvel article créé au catalogue : "${nomArticle}"`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 return {
//                     id: article.id,
//                     nom: article.nom,
//                     createdAt: article.createdAt,
//                     message: 'Article créé avec succès au catalogue. Vous pouvez maintenant y ajouter des formats (ex: Sac, Bouteille).',
//                 };
//             });
//         } catch (error) {
//             this.logger.error(`❌ Erreur création article simple : ${error.message}`);
//             if (error instanceof ConflictException) throw error;
//             throw new InternalServerErrorException("Une erreur technique empêche la création de l'article.");
//         }
//     }

//     // ─── CREATE ARTICLE WITH CATEGORY ────────────────────────────────────────
//     async createArticleWithCategory(
//         dto: CreateArticleDto,
//         currentUser: any,
//     ): Promise<CreateArticleResponseDto> {
//         const { nom, nomUniqueCategory, prixUnite, description, seuilAlerte, seuilCritique } = dto;
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         this.logger.log(`🚀 Tentative de création de l'article : ${nom}`);

//         const actorName = await this.audit.resolveActorName(userId);

//         try {
//             return this.prisma.$transaction(async (tx) => {
//                 const article = await tx.article.create({
//                     data: {
//                         nom,
//                         categories: {
//                             create: {
//                                 nomUnique: nomUniqueCategory,
//                                 prixUnite,
//                                 description,
//                             },
//                         },
//                     },
//                     include: { categories: true },
//                 });

//                 const category = article.categories[0];

//                 const stock = await tx.articleStock.create({
//                     data: {
//                         articleId: article.id,
//                         categoryId: category.id,
//                         quantiteActuelle: 0,
//                         niveauAlerte: TypeSeuil.CRITIQUE,
//                         seuilAlerte,
//                         seuilCritique,
//                     },
//                 });

//                 await tx.movementStock.create({
//                     data: {
//                         type: 'INITIALISATION',
//                         quantiteSortieOuEntree: 0,
//                         quantiteAvant: 0,
//                         quantiteApres: 0,
//                         isSystem: true,
//                         movementDate: new Date(),
//                         articleId: article.id,
//                         articleStockId: stock.id,
//                         userId,
//                         motif: `Initialisation système : format ${category.nomUnique}`,
//                     },
//                 });

//                 await this.audit.log({
//                     actorId: userId,
//                     actorName,
//                     module: AuditModule.DEPARTMENT,
//                     action: 'CREATE_ARTICLE_FULL',
//                     level: LogLevel.INFO,
//                     entityId: article.id,
//                     entityName: article.nom,
//                     apres: {
//                         nom,
//                         category: category.nomUnique,
//                         stockId: stock.id,
//                         seuilAlerte,
//                         seuilCritique,
//                     },
//                     message: `Article "${nom}" créé avec son format initial "${category.nomUnique}".`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 return {
//                     id: article.id,
//                     message: `Article et format "${category.nomUnique}" créés avec succès.`,
//                     stockId: stock.id,
//                     articleName: article.nom,
//                     categoryName: category.nomUnique,
//                 };
//             });
//         } catch (error) {
//             this.logger.error(`❌ Erreur création article : ${error.message}`);
//             throw new InternalServerErrorException("Échec de la création de l'article et de son format.");
//         }
//     }

//     // ─── FIND ALL ─────────────────────────────────────────────────────────────
//     async findAll(
//         query: GetArticlesQueryDto,
//         currentUser: any,
//     ): Promise<GetArticlesResponseDto> {
//         const { page = 1, limit = 10, status = ArticleStatusFilter.ACTIVE, search } = query;
//         const skip = (page - 1) * limit;
//         const { sub: userId, email: userEmail } = currentUser;

//         this.logger.log(`🔍 Catalogue par ${userEmail} | Filtre: ${status} | Search: ${search || 'aucun'}`);

//         try {
//             const whereClause: Prisma.ArticleWhereInput = {};

//             if (status === ArticleStatusFilter.ACTIVE) whereClause.deletedAt = null;
//             if (status === ArticleStatusFilter.ARCHIVED) whereClause.deletedAt = { not: null };

//             if (search) {
//                 whereClause.OR = [
//                     { nom: { contains: search, mode: 'insensitive' } },
//                     { categories: { some: { nomUnique: { contains: search, mode: 'insensitive' } } } },
//                 ];
//             }

//             const [total, articles] = await this.prisma.$transaction([
//                 this.prisma.article.count({ where: whereClause }),
//                 this.prisma.article.findMany({
//                     where: whereClause,
//                     skip,
//                     take: limit,
//                     include: { stocks: { include: { category: true } } },
//                     orderBy: [{ nom: 'asc' }, { createdAt: 'desc' }],
//                 }),
//             ]);

//             const formattedData = articles.map((article) => {
//                 const aggregate = article.stocks.reduce(
//                     (acc, s) => {
//                         const prix = s.category?.prixUnite;
//                         if (prix == null) {
//                             throw new Error(`Prix unitaire manquant pour le stock : ${s.id || 'ID inconnu'}`);
//                         }
//                         return {
//                             quantiteTotale: acc.quantiteTotale + s.quantiteActuelle,
//                             valeurTotale: acc.valeurTotale + s.quantiteActuelle * prix,
//                         };
//                     },
//                     { quantiteTotale: 0, valeurTotale: 0 },
//                 );

//                 return {
//                     id: article.id,
//                     nom: article.nom,
//                     createdAt: article.createdAt,
//                     isArchived: article.deletedAt !== null,
//                     formats: article.stocks.map((s) => s.category.nomUnique),
//                     quantiteTotale: aggregate.quantiteTotale,
//                     valeurTotale: aggregate.valeurTotale,
//                     enAlerte: article.stocks.some((s) => s.niveauAlerte !== 'NORMAL'),
//                 };
//             });

//             // Non-blocking audit log
//             this.audit.log({
//                 actorId: userId,
//                 actorName: userEmail,
//                 module: AuditModule.DEPARTMENT,
//                 action: 'READ_ARTICLES',
//                 level: LogLevel.INFO,
//                 message: `Consultation catalogue (${status}). ${total} articles trouvés.`,
//                 state: State.SUCCESS,
//             }).catch((err) => this.logger.error(`Erreur audit findAll: ${err.message}`));

//             return {
//                 data: formattedData,
//                 meta: {
//                     total,
//                     page,
//                     limit,
//                     totalPages: Math.ceil(total / limit),
//                     hasNextPage: page * limit < total,
//                     hasPreviousPage: page > 1,
//                 },
//             };

//         } catch (error) {
//             this.logger.error(`❌ Erreur findAll Article : ${error.message}`);
//             throw new InternalServerErrorException('Erreur lors de la récupération du catalogue.');
//         }
//     }

//     // ─── FIND ONE ─────────────────────────────────────────────────────────────
//     async findOne(id: string, currentUser: any): Promise<ArticleDetailResponseDto> {
//         const { sub: userId, email: userEmail } = currentUser;

//         this.logger.log(`🔍 Détails Article ID: ${id} par ${userEmail}`);

//         if (!userId || !userEmail) throw new UnauthorizedException('Session utilisateur non identifiée.');

//         try {
//             const article = await this.prisma.article.findUnique({
//                 where: { id },
//                 select: {
//                     id: true,
//                     nom: true,
//                     deletedAt: true,
//                     createdAt: true,
//                     stocks: {
//                         where: { deletedAt: null, category: { deletedAt: null } },
//                         select: {
//                             id: true,
//                             quantiteActuelle: true,
//                             niveauAlerte: true,
//                             category: {
//                                 select: { id: true, nomUnique: true, prixUnite: true },
//                             },
//                         },
//                     },
//                 },
//             });

//             if (!article) throw new NotFoundException(`L'article avec l'ID "${id}" n'existe pas.`);

//             const isArchived = article.deletedAt !== null;

//             // Non-blocking audit log
//             this.audit.log({
//                 actorId: userId,
//                 actorName: userEmail,
//                 module: AuditModule.DEPARTMENT,
//                 action: 'READ_ARTICLE_DETAIL',
//                 level: LogLevel.INFO,
//                 entityId: article.id,
//                 entityName: article.nom,
//                 message: `Consultation article : ${article.nom} ${isArchived ? '(ARCHIVÉ)' : '(ACTIF)'}`,
//                 state: State.SUCCESS,
//             }).catch((err) => this.logger.error(`Erreur audit findOne: ${err.message}`));

//             const detailsStock: StockDetailItem[] = article.stocks.map((s) => ({
//                 stockId: s.id,
//                 format: s.category.nomUnique,
//                 prixUnite: s.category.prixUnite,
//                 quantite: s.quantiteActuelle,
//                 niveauAlerte: s.niveauAlerte,
//                 valeurEstimee: s.quantiteActuelle * s.category.prixUnite,
//             }));

//             return {
//                 id: article.id,
//                 nom: article.nom,
//                 createdAt: article.createdAt,
//                 isArchived,
//                 archivedAt: article.deletedAt,
//                 canMoveStock: !isArchived,
//                 detailsStock,
//                 quantiteTotale: article.stocks.reduce((acc, curr) => acc + curr.quantiteActuelle, 0),
//             };

//         } catch (error) {
//             if (error instanceof HttpException) throw error;
//             this.logger.error(`❌ Erreur technique findOne Article : ${error.message}`);
//             throw new InternalServerErrorException("Erreur technique lors de la récupération des détails de l'article.");
//         }
//     }

//     // ─── GET CATEGORIES BY ARTICLE ────────────────────────────────────────────
//     async getCategoriesByArticle(
//         articleId: string,
//         query: GetCategoriesByArticleQueryDto,
//         currentUser: any,
//     ): Promise<any> {
//         const { page = 1, limit = 10 } = query;
//         const skip = (page - 1) * limit;
//         const { sub: userId, email: userEmail } = currentUser;

//         this.logger.log(
//             `🔍 Categories for article #${articleId} | Page: ${page} | Limit: ${limit} | By: ${userEmail}`,
//         );

//         try {
//             const [articleExists, total, categories] = await this.prisma.$transaction([
//                 this.prisma.article.findUnique({
//                     where: { id: articleId },
//                     select: { id: true, nom: true },
//                 }),
//                 this.prisma.category.count({ where: { articleId, deletedAt: null } }),
//                 this.prisma.category.findMany({
//                     where: { articleId, deletedAt: null },
//                     select: {
//                         id: true,
//                         nomUnique: true,
//                         prixUnite: true,
//                         description: true,
//                         createdAt: true,
//                         stocks: {
//                             select: { quantiteActuelle: true, niveauAlerte: true },
//                         },
//                     },
//                     orderBy: [{ createdAt: 'asc' }],
//                     skip,
//                     take: limit,
//                 }),
//             ]);

//             if (!articleExists) throw new NotFoundException(`Article #${articleId} not found`);

//             const formattedCategories = categories.map((cat) => {
//                 const quantiteTotale = cat.stocks.reduce((acc, s) => acc + s.quantiteActuelle, 0);
//                 return {
//                     id: cat.id,
//                     nomUnique: cat.nomUnique,
//                     prixUnite: cat.prixUnite,
//                     description: cat.description,
//                     createdAt: cat.createdAt,
//                     quantiteTotale,
//                     valeurTotale: quantiteTotale * cat.prixUnite,
//                     enAlerte: cat.stocks.some((s) => s.niveauAlerte !== 'NORMAL'),
//                 };
//             });

//             // Non-blocking audit log
//             this.audit.log({
//                 actorId: userId,
//                 actorName: userEmail,
//                 module: AuditModule.DEPARTMENT,
//                 action: 'READ_CATEGORIES_BY_ARTICLE',
//                 level: LogLevel.INFO,
//                 entityId: articleId,
//                 entityName: articleExists.nom,
//                 message: `Categories of article "${articleExists.nom}" consulted. ${total} found. Page ${page}/${Math.ceil(total / limit)}.`,
//                 state: State.SUCCESS,
//             }).catch((err) => this.logger.error(`Erreur audit getCategoriesByArticle: ${err.message}`));

//             return {
//                 articleId,
//                 articleNom: articleExists.nom,
//                 data: formattedCategories,
//                 meta: {
//                     total,
//                     page,
//                     limit,
//                     totalPages: Math.ceil(total / limit),
//                     hasNextPage: page * limit < total,
//                     hasPreviousPage: page > 1,
//                 },
//             };

//         } catch (error) {
//             if (error instanceof NotFoundException) throw error;
//             this.logger.error(`❌ Error getCategoriesByArticle : ${error.message}`);
//             throw new InternalServerErrorException('Error while fetching categories for this article.');
//         }
//     }

//     // ─── UPDATE ───────────────────────────────────────────────────────────────
//     async update(
//         id: string,
//         dto: UpdateArticleDto,
//         currentUser: any,
//     ): Promise<UpdateArticleResponseDto> {
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;
//         const { nom } = dto;

//         this.logger.log(`📝 Mise à jour de l'article ID: ${id} par ${userEmail}`);

//         const actorName = await this.audit.resolveActorName(userId);

//         try {
//             return this.prisma.$transaction(async (tx) => {
//                 const currentArticle = await tx.article.findUnique({ where: { id } });

//                 if (!currentArticle) throw new NotFoundException("L'article spécifié n'existe pas.");
//                 if (currentArticle.deletedAt !== null) {
//                     throw new ForbiddenException(
//                         'Action refusée : Cet article est archivé. Vous devez le restaurer avant de pouvoir le modifier.',
//                     );
//                 }

//                 const updatedArticle = await tx.article.update({
//                     where: { id },
//                     data: { nom: nom ?? undefined },
//                     include: {
//                         stocks: {
//                             where: { deletedAt: null, category: { deletedAt: null } },
//                             include: { category: true },
//                         },
//                     },
//                 });

//                 await this.audit.log({
//                     actorId: userId,
//                     actorName,
//                     module: AuditModule.DEPARTMENT,
//                     action: 'UPDATE_ARTICLE',
//                     level: LogLevel.INFO,
//                     entityId: id,
//                     entityName: updatedArticle.nom,
//                     avant: { nom: currentArticle.nom },
//                     apres: { nom: updatedArticle.nom },
//                     message: `Mise à jour article "${currentArticle.nom}" : Nom=${updatedArticle.nom}`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 this.logger.log(`✅ Article "${updatedArticle.nom}" mis à jour avec succès.`);

//                 return {
//                     id: updatedArticle.id,
//                     nom: updatedArticle.nom,
//                     updatedAt: updatedArticle.updatedAt,
//                     message: "L'article a été mis à jour avec succès.",
//                 };
//             });

//         } catch (error) {
//             if (error instanceof HttpException) throw error;
//             this.logger.error(`❌ Échec technique update article ${id} : ${error.message}`);
//             throw new InternalServerErrorException("Une erreur technique empêche la mise à jour de l'article.");
//         }
//     }

//     // ─── SOFT DELETE ──────────────────────────────────────────────────────────
//     async softDeleteArticle(id: string, currentUser: any): Promise<DeleteArticleResponseDto> {
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         const actorName = await this.audit.resolveActorName(userId);

//         return this.prisma.$transaction(async (tx): Promise<DeleteArticleResponseDto> => {
//             const article = await tx.article.findUnique({
//                 where: { id },
//                 include: { stocks: true },
//             });

//             if (!article) throw new NotFoundException('Article introuvable.');

//             const stockTotal = article.stocks.reduce((acc, s) => acc + s.quantiteActuelle, 0);
//             if (stockTotal > 0) {
//                 throw new ForbiddenException(
//                     `Impossible de supprimer l'article : il reste ${stockTotal} unités en stock.`,
//                 );
//             }

//             const now = new Date();

//             await tx.articleStock.updateMany({ where: { articleId: id }, data: { deletedAt: now } });
//             await tx.category.updateMany({ where: { articleId: id }, data: { deletedAt: now } });

//             const deletedArticle = await tx.article.update({
//                 where: { id },
//                 data: { deletedAt: now },
//             });

//             await this.audit.log({
//                 actorId: userId,
//                 actorName,
//                 module: AuditModule.DEPARTMENT,
//                 action: 'SOFT_DELETE_ARTICLE',
//                 level: LogLevel.WARNING,
//                 entityId: id,
//                 entityName: article.nom,
//                 avant: { deletedAt: null },
//                 apres: { deletedAt: now },
//                 message: `L'article "${article.nom}" et tous ses formats ont été archivés.`,
//                 state: State.SUCCESS,
//             }, tx);

//             return {
//                 id: deletedArticle.id,
//                 message: `L'article "${article.nom}" et ses dépendances ont été archivés.`,
//                 deletedAt: now,
//             };
//         });
//     }

//     // ─── RESTORE ──────────────────────────────────────────────────────────────
//     async restoreArticle(id: string, currentUser: any): Promise<RestoreArticleResponseDto> {
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         this.logger.log(`♻️ Tentative de restauration de l'article ID: ${id} par ${userEmail}`);

//         const actorName = await this.audit.resolveActorName(userId);

//         try {
//             return this.prisma.$transaction(async (tx): Promise<RestoreArticleResponseDto> => {
//                 const article = await tx.article.findUnique({
//                     where: { id },
//                     select: { id: true, nom: true, deletedAt: true },
//                 });

//                 if (!article) throw new NotFoundException('Article introuvable.');
//                 if (article.deletedAt === null) throw new BadRequestException('Cet article est déjà actif.');

//                 await tx.articleStock.updateMany({ where: { articleId: id }, data: { deletedAt: null } });
//                 await tx.category.updateMany({ where: { articleId: id }, data: { deletedAt: null } });

//                 const restoredArticle = await tx.article.update({
//                     where: { id },
//                     data: { deletedAt: null },
//                     include: { stocks: { include: { category: true } } },
//                 });

//                 await this.audit.log({
//                     actorId: userId,
//                     actorName,
//                     module: AuditModule.DEPARTMENT,
//                     action: 'RESTORE_ARTICLE',
//                     level: LogLevel.INFO,
//                     entityId: id,
//                     entityName: restoredArticle.nom,
//                     avant: { deletedAt: article.deletedAt },
//                     apres: { deletedAt: null },
//                     message: `L'article "${restoredArticle.nom}" et tous ses formats ont été restaurés.`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 this.logger.log(`✅ Article "${restoredArticle.nom}" restauré avec succès.`);

//                 return {
//                     id: restoredArticle.id,
//                     nom: restoredArticle.nom,
//                     message: 'Article et formats associés restaurés avec succès.',
//                     restoredAt: new Date(),
//                 };
//             });

//         } catch (error) {
//             if (error instanceof HttpException) throw error;
//             this.logger.error(`❌ Erreur restauration article : ${error.message}`);
//             throw new InternalServerErrorException("Échec de la restauration de l'article.");
//         }
//     }

//     // ─── HARD DELETE ──────────────────────────────────────────────────────────
//     async hardDeleteArticle(id: string, currentUser: any): Promise<HardDeleteResponseDto> {
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         this.logger.warn(`⚠️ SUPPRESSION DÉFINITIVE : Article ID ${id} par ${userEmail}`);

//         const actorName = await this.audit.resolveActorName(userId);

//         try {
//             return this.prisma.$transaction(async (tx): Promise<HardDeleteResponseDto> => {
//                 const article = await tx.article.findUnique({
//                     where: { id },
//                     include: {
//                         _count: { select: { mouvements: { where: { isSystem: false } } } },
//                     },
//                 });

//                 if (!article) throw new NotFoundException('Article introuvable.');

//                 if (article._count.mouvements > 0) {
//                     throw new ForbiddenException(
//                         'Suppression définitive impossible : cet article possède un historique de mouvements réels. Utilisez le Soft Delete (archivage) à la place.',
//                     );
//                 }

//                 await tx.article.delete({ where: { id } });

//                 await this.audit.log({
//                     actorId: userId,
//                     actorName,
//                     module: AuditModule.DEPARTMENT,
//                     action: 'HARD_DELETE_ARTICLE',
//                     level: LogLevel.WARNING,
//                     entityId: id,
//                     entityName: article.nom,
//                     avant: { nom: article.nom, id },
//                     message: `L'article "${article.nom}" (ID: ${id}) a été supprimé définitivement.`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 this.logger.log(`🗑️ Article "${article.nom}" supprimé définitivement.`);

//                 return {
//                     deletedId: id,
//                     articleName: article.nom,
//                     message: "L'article et toutes ses données liées ont été supprimés définitivement.",
//                     timestamp: new Date(),
//                 };
//             });

//         } catch (error) {
//             if (error instanceof HttpException) throw error;
//             this.logger.error(`❌ Erreur hardDelete article : ${error.message}`);
//             throw new InternalServerErrorException('Échec de la suppression définitive.');
//         }
//     }
// }




// @Injectable()
// export class ArticleService {
//     constructor(
//         private readonly prisma: PrismaService,
//         private readonly logService: LogService,
//     ) { }

//     private readonly STOCK_MODULE = 'STOCK_MODULE';
//     private readonly logger = new Logger(ArticleService.name);

//     async createSimpleArticle(dto: CreateSimpleArticleDto, currentUser: any): Promise<CreateSimpleArticleResponseDto> {
//         const { nomArticle } = dto;
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         this.logger.log(`🏗️ [ArticleService] Création de l'article de base : ${nomArticle}`);

//         // 1. Vérification d'unicité
//         const existingArticle = await this.prisma.article.findUnique({
//             where: { nom: nomArticle }
//         });

//         if (existingArticle) {
//             throw new ConflictException(`L'article "${nomArticle}" existe déjà dans le catalogue.`);
//         }

//         try {
//             return await this.prisma.$transaction(async (tx): Promise<CreateSimpleArticleResponseDto> => {
//                 // 2. Création de l'article
//                 const article = await tx.article.create({
//                     data: {
//                         nom: nomArticle,
//                         // Note: categories et stocks restent vides pour l'instant
//                     }
//                 });

//                 // 3. Audit Trail (Essentiel pour la traçabilité ndolecam)
//                 await this.logService.createLog({
//                     module: 'STOCK_MODULE',
//                     level: LogLevel.INFO,
//                     userId,
//                     email: userEmail,
//                     action: 'CREATE_SIMPLE_ARTICLE',
//                     message: `Nouvel article créé au catalogue : "${nomArticle}"`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 return {
//                     id: article.id,
//                     nom: article.nom,
//                     createdAt: article.createdAt,
//                     message: "Article créé avec succès au catalogue. Vous pouvez maintenant y ajouter des formats (ex: Sac, Bouteille)."
//                 };
//             });
//         } catch (error) {
//             this.logger.error(`❌ Erreur lors de la création de l'article simple : ${error.message}`);
//             if (error instanceof ConflictException) throw error;
//             throw new InternalServerErrorException("Une erreur technique empêche la création de l'article.");
//         }
//     }

//     async createArticleWithCategory(dto: CreateArticleDto, currentUser: any): Promise<CreateArticleResponseDto> {
//         const { nom, nomUniqueCategory, prixUnite, description, seuilAlerte, seuilCritique } = dto; // DTO adapté
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         this.logger.log(`🚀 [1/3] Tentative de création de l'article : ${nom}`);

//         try {
//             return await this.prisma.$transaction(async (tx) => {

//                 // A. CRÉATION DE L'ARTICLE + LA CATÉGORIE (Déclinaison)
//                 // On crée l'article et on lui injecte son premier format immédiatement
//                 const article = await tx.article.create({
//                     data: {
//                         nom,
//                         categories: {
//                             create: {
//                                 nomUnique: nomUniqueCategory,
//                                 prixUnite: prixUnite,
//                                 description: description,
//                             }
//                         }
//                     },
//                     include: { categories: true }
//                 });

//                 const category = article.categories[0];

//                 // B. INITIALISATION DU STOCK (ArticleStock)
//                 const stock = await tx.articleStock.create({
//                     data: {
//                         articleId: article.id,
//                         categoryId: category.id,
//                         quantiteActuelle: 0,
//                         niveauAlerte: TypeSeuil.CRITIQUE,
//                         seuilAlerte: seuilAlerte,
//                         seuilCritique: seuilCritique,
//                     }
//                 });

//                 // C. MOUVEMENT SYSTÈME INITIAL
//                 await tx.movementStock.create({
//                     data: {
//                         type: 'INITIALISATION',
//                         quantiteSortieOuEntree: 0,
//                         quantiteAvant: 0,
//                         quantiteApres: 0,
//                         isSystem: true,
//                         movementDate: new Date(),
//                         articleId: article.id,
//                         articleStockId: stock.id,
//                         userId: userId,
//                         motif: `Initialisation système : format ${category.nomUnique}`,
//                     }
//                 });

//                 // D. AUDIT LOG
//                 await this.logService.createLog({
//                     module: 'STOCK_MODULE',
//                     level: LogLevel.INFO,
//                     userId,
//                     email: userEmail,
//                     action: 'CREATE_ARTICLE_FULL',
//                     message: `Article "${nom}" créé avec son format initial "${category.nomUnique}".`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 return {
//                     id: article.id,
//                     message: `Article et format "${category.nomUnique}" créés avec succès.`,
//                     stockId: stock.id,
//                     articleName: article.nom,
//                     categoryName: category.nomUnique,
//                 };

//             });
//         } catch (error) {
//             this.logger.error(`❌ Erreur création article : ${error.message}`);
//             throw new InternalServerErrorException("Échec de la création de l'article et de son format.");
//         }
//     }

//     // async findAll(query: GetArticlesQueryDto, currentUser: any): Promise<GetArticlesResponseDto> {
//     //     const {
//     //         page = 1,
//     //         limit = 10,
//     //         status = ArticleStatusFilter.ACTIVE,
//     //         search
//     //     } = query;

//     //     const skip = (page - 1) * limit;
//     //     const { sub: userId, email: userEmail } = currentUser;

//     //     this.logger.log(`🔍 [1/2] Catalogue par ${userEmail} | Filtre: ${status} | Search: ${search || 'aucun'}`);

//     //     try {
//     //         // 1. Construction de la clause WHERE dynamique
//     //         const whereClause: Prisma.ArticleWhereInput = {};

//     //         // A. Gestion du Soft Delete
//     //         if (status === ArticleStatusFilter.ACTIVE) {
//     //             whereClause.deletedAt = null;
//     //         } else if (status === ArticleStatusFilter.ARCHIVED) {
//     //             whereClause.deletedAt = { not: null };
//     //         }

//     //         // B. Gestion de la recherche (Nom de l'article ou Nom de la catégorie)
//     //         if (search) {
//     //             whereClause.OR = [
//     //                 { nom: { contains: search, mode: 'insensitive' } },
//     //                 { categories: { some: { nomUnique: { contains: search, mode: 'insensitive' } } } }
//     //             ];
//     //         }

//     //         // 2. Exécution synchronisée
//     //         const [total, articles] = await this.prisma.$transaction([
//     //             this.prisma.article.count({ where: whereClause }),
//     //             this.prisma.article.findMany({
//     //                 where: whereClause,
//     //                 skip,
//     //                 take: limit,
//     //                 include: {
//     //                     // On récupère les stocks ET les catégories liées pour les calculs
//     //                     stocks: {
//     //                         include: {
//     //                             category: true
//     //                         }
//     //                     }
//     //                 },
//     //                 orderBy: { nom: 'asc' },
//     //             }),
//     //         ]);

//     //         // 3. Transformation pour le Frontend (Agrégation des stocks)
//     //         const formattedData = articles.map(article => {
//     //             const isArchived = article.deletedAt !== null;

//     //             // Calcul global sur toutes les déclinaisons de l'article
//     //             const aggregate = article.stocks.reduce((acc, s) => {
//     //                 const prix = s.category?.prixUnite;
//     //                 if (prix == null) { // capture null et undefined
//     //                     throw new Error(`Prix unitaire manquant pour le stock : ${s.id || 'ID inconnu'}`);
//     //                 }
//     //                 const valeur = s.quantiteActuelle * prix;
//     //                 return {
//     //                     quantiteTotale: acc.quantiteTotale + s.quantiteActuelle,
//     //                     valeurTotale: acc.valeurTotale + valeur
//     //                 };
//     //             }, { quantiteTotale: 0, valeurTotale: 0 });


//     //             return {
//     //                 id: article.id,
//     //                 nom: article.nom,
//     //                 createdAt: article.createdAt,
//     //                 isArchived: article.deletedAt !== null,
//     //                 formats: article.stocks.map(s => s.category.nomUnique),
//     //                 quantiteTotale: aggregate.quantiteTotale,
//     //                 valeurTotale: aggregate.valeurTotale,
//     //                 enAlerte: article.stocks.some(s => s.niveauAlerte !== 'NORMAL')
//     //             };
//     //         });

//     //         // 4. Audit Log
//     //         await this.logService.createLog({
//     //             module: 'STOCK_MODULE',
//     //             level: LogLevel.INFO,
//     //             userId,
//     //             email: userEmail,
//     //             action: 'READ_ARTICLES',
//     //             message: `Consultation catalogue (${status}). ${total} articles trouvés.`,
//     //             state: State.SUCCESS,
//     //         });

//     //         return {
//     //             data: formattedData,
//     //             meta: {
//     //                 total,
//     //                 page,
//     //                 limit,
//     //                 totalPages: Math.ceil(total / limit),
//     //                 hasNextPage: page * limit < total,
//     //                 hasPreviousPage: page > 1,
//     //             },
//     //         };

//     //     } catch (error) {
//     //         this.logger.error(`❌ Erreur findAll Article : ${error.message}`);
//     //         throw new InternalServerErrorException("Erreur lors de la récupération du catalogue.");
//     //     }
//     // }

//     async findAll(query: GetArticlesQueryDto, currentUser: any): Promise<GetArticlesResponseDto> {
//         const {
//             page = 1,
//             limit = 10,
//             status = ArticleStatusFilter.ACTIVE,
//             search,
//         } = query;

//         const skip = (page - 1) * limit;
//         const { sub: userId, email: userEmail } = currentUser;

//         this.logger.log(
//             `🔍 Catalogue par ${userEmail} | Filtre: ${status} | Search: ${search || 'aucun'}`,
//         );

//         try {
//             // 1. Construction de la clause WHERE dynamique
//             const whereClause: Prisma.ArticleWhereInput = {};

//             // A. Gestion du Soft Delete
//             if (status === ArticleStatusFilter.ACTIVE) {
//                 whereClause.deletedAt = null;
//             } else if (status === ArticleStatusFilter.ARCHIVED) {
//                 whereClause.deletedAt = { not: null };
//             }
//             // ALL → pas de filtre deletedAt

//             // B. Gestion de la recherche
//             if (search) {
//                 whereClause.OR = [
//                     { nom: { contains: search, mode: 'insensitive' } },
//                     { categories: { some: { nomUnique: { contains: search, mode: 'insensitive' } } } },
//                 ];
//             }

//             // 2. Exécution parallèle
//             const [total, articles] = await this.prisma.$transaction([
//                 this.prisma.article.count({ where: whereClause }),
//                 this.prisma.article.findMany({
//                     where: whereClause,
//                     skip,
//                     take: limit,
//                     include: {
//                         stocks: {
//                             include: { category: true },
//                         },
//                     },
//                     orderBy: [
//                         { nom: 'asc' }, // alphabetical order
//                         { createdAt: 'desc' }, // tiebreaker
//                     ],
//                 }),
//             ]);

//             // 3. Transformation pour le Frontend
//             const formattedData = articles.map((article) => {
//                 const aggregate = article.stocks.reduce(
//                     (acc, s) => {
//                         const prix = s.category?.prixUnite;
//                         if (prix == null) {
//                             throw new Error(
//                                 `Prix unitaire manquant pour le stock : ${s.id || 'ID inconnu'}`,
//                             );
//                         }
//                         return {
//                             quantiteTotale: acc.quantiteTotale + s.quantiteActuelle,
//                             valeurTotale: acc.valeurTotale + s.quantiteActuelle * prix,
//                         };
//                     },
//                     { quantiteTotale: 0, valeurTotale: 0 },
//                 );

//                 return {
//                     id: article.id,
//                     nom: article.nom,
//                     createdAt: article.createdAt,
//                     isArchived: article.deletedAt !== null,
//                     formats: article.stocks.map((s) => s.category.nomUnique),
//                     quantiteTotale: aggregate.quantiteTotale,
//                     valeurTotale: aggregate.valeurTotale,
//                     enAlerte: article.stocks.some((s) => s.niveauAlerte !== 'NORMAL'),
//                 };
//             });

//             // 4. Audit Log
//             await this.logService.createLog({
//                 module: 'STOCK_MODULE',
//                 level: LogLevel.INFO,
//                 userId,
//                 email: userEmail,
//                 action: 'READ_ARTICLES',
//                 message: `Consultation catalogue (${status}). ${total} articles trouvés.`,
//                 state: State.SUCCESS,
//             });

//             return {
//                 data: formattedData,
//                 meta: {
//                     total,
//                     page,
//                     limit,
//                     totalPages: Math.ceil(total / limit),
//                     hasNextPage: page * limit < total,
//                     hasPreviousPage: page > 1,
//                 },
//             };

//         } catch (error) {
//             this.logger.error(`❌ Erreur findAll Article : ${error.message}`);
//             throw new InternalServerErrorException(
//                 'Erreur lors de la récupération du catalogue.',
//             );
//         }
//     }

//     async findOne(id: string, currentUser: any): Promise<ArticleDetailResponseDto> {
//         const { sub: userId, email: userEmail } = currentUser;

//         this.logger.log(`🔍 [1/2] Détails Article ID: ${id} par ${userEmail}`);

//         if (!userId || !userEmail) {
//             throw new UnauthorizedException("Session utilisateur non identifiée.");
//         }

//         try {
//             const article = await this.prisma.article.findUnique({
//                 where: { id },
//                 select: {
//                     id: true,
//                     nom: true,
//                     deletedAt: true,
//                     createdAt: true,
//                     // On filtre pour ne récupérer que les stocks actifs
//                     stocks: {
//                         where: {
//                             deletedAt: null,
//                             category: { deletedAt: null } // Sécurité supplémentaire : la catégorie doit être active
//                         },
//                         select: {
//                             id: true,
//                             quantiteActuelle: true,
//                             niveauAlerte: true,
//                             category: {
//                                 select: {
//                                     id: true,
//                                     nomUnique: true,
//                                     prixUnite: true,
//                                 }
//                             }
//                         }
//                     }
//                 },
//             });

//             // 1. Gestion de l'existence
//             if (!article) {
//                 throw new NotFoundException(`L'article avec l'ID "${id}" n'existe pas.`);
//             }

//             const isArchived = article.deletedAt !== null;

//             // 2. Audit Log
//             await this.logService.createLog({
//                 module: 'STOCK_MODULE',
//                 level: LogLevel.INFO,
//                 userId,
//                 email: userEmail,
//                 action: 'READ_ARTICLE_DETAIL',
//                 message: `Consultation article : ${article.nom} ${isArchived ? '(ARCHIVÉ)' : '(ACTIF)'}`,
//                 state: State.SUCCESS,
//             });



//             // 3. Transformation avec typage strict
//             const detailsStock: StockDetailItem[] = article.stocks.map(s => ({
//                 stockId: s.id,
//                 format: s.category.nomUnique,
//                 prixUnite: s.category.prixUnite,
//                 quantite: s.quantiteActuelle,
//                 niveauAlerte: s.niveauAlerte,
//                 valeurEstimee: s.quantiteActuelle * s.category.prixUnite
//             }));

//             return {
//                 id: article.id,
//                 nom: article.nom,
//                 createdAt: article.createdAt,
//                 isArchived: isArchived,
//                 archivedAt: article.deletedAt,
//                 canMoveStock: !isArchived,  // Empêche les mouvements si l'article est archivé
//                 detailsStock,
//                 // Somme totale des quantités sur les formats actifs uniquement
//                 quantiteTotale: article.stocks.reduce((acc, curr) => acc + curr.quantiteActuelle, 0)
//             };

//         } catch (error) {
//             if (error instanceof HttpException) throw error;

//             this.logger.error(`❌ Erreur technique findOne Article : ${error.message}`);
//             throw new InternalServerErrorException("Erreur technique lors de la récupération des détails de l'article.");
//         }
//     }


//     async getCategoriesByArticle(
//         articleId: string,
//         query: GetCategoriesByArticleQueryDto,
//         currentUser: any,
//     ): Promise<any> {
//         const { page = 1, limit = 10 } = query;
//         const skip = (page - 1) * limit;
//         const { sub: userId, email: userEmail } = currentUser;

//         this.logger.log(
//             `🔍 Categories for article #${articleId} | Page: ${page} | Limit: ${limit} | By: ${userEmail}`,
//         );

//         try {
//             // Single transaction — existence check + count + paginated categories
//             const [articleExists, total, categories] = await this.prisma.$transaction([
//                 this.prisma.article.findUnique({
//                     where: { id: articleId },
//                     select: { id: true, nom: true },
//                 }),
//                 this.prisma.category.count({
//                     where: { articleId, deletedAt: null },
//                 }),
//                 this.prisma.category.findMany({
//                     where: { articleId, deletedAt: null },
//                     select: {
//                         id: true,
//                         nomUnique: true,
//                         prixUnite: true,
//                         description: true,
//                         createdAt: true,
//                         stocks: {
//                             select: {
//                                 quantiteActuelle: true,
//                                 niveauAlerte: true,
//                             },
//                         },
//                     },
//                     orderBy: { createdAt: 'asc' },
//                     skip,
//                     take: limit,
//                 }),
//             ]);

//             if (!articleExists) {
//                 throw new NotFoundException(`Article #${articleId} not found`);
//             }

//             // Aggregation — same pattern as findAll
//             const formattedCategories = categories.map((cat) => {
//                 const quantiteTotale = cat.stocks.reduce(
//                     (acc, s) => acc + s.quantiteActuelle, 0,
//                 );
//                 return {
//                     id: cat.id,
//                     nomUnique: cat.nomUnique,
//                     prixUnite: cat.prixUnite,
//                     description: cat.description,
//                     createdAt: cat.createdAt,
//                     quantiteTotale,
//                     valeurTotale: quantiteTotale * cat.prixUnite,
//                     enAlerte: cat.stocks.some((s) => s.niveauAlerte !== 'NORMAL'),
//                 };
//             });

//             // Audit log
//             await this.logService.createLog({
//                 module: 'STOCK_MODULE',
//                 level: LogLevel.INFO,
//                 userId,
//                 email: userEmail,
//                 action: 'READ_CATEGORIES_BY_ARTICLE',
//                 message: `Categories of article "${articleExists.nom}" consulted. ${total} found. Page ${page}/${Math.ceil(total / limit)}.`,
//                 state: State.SUCCESS,
//             });

//             return {
//                 articleId,
//                 articleNom: articleExists.nom,
//                 data: formattedCategories,
//                 meta: {
//                     total,
//                     page,
//                     limit,
//                     totalPages: Math.ceil(total / limit),
//                     hasNextPage: page * limit < total,
//                     hasPreviousPage: page > 1,
//                 },
//             };

//         } catch (error) {
//             if (error instanceof NotFoundException) throw error;
//             this.logger.error(`❌ Error getCategoriesByArticle : ${error.message}`);
//             throw new InternalServerErrorException(
//                 'Error while fetching categories for this article.',
//             );
//         }
//     }


//     async update(id: string, dto: UpdateArticleDto, currentUser: any): Promise<UpdateArticleResponseDto> {
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         this.logger.log(`📝 [1/2] Mise à jour de l'article ID: ${id} par ${userEmail}`);

//         const { nom } = dto;

//         try {
//             return await this.prisma.$transaction(async (tx) => {
//                 // 1. Récupération et vérification d'existence
//                 const currentArticle = await tx.article.findUnique({
//                     where: { id }
//                 });

//                 if (!currentArticle) {
//                     throw new NotFoundException(`L'article spécifié n'existe pas.`);
//                 }

//                 // 2. VÉRIFICATION DE SÉCURITÉ : État de l'article
//                 // Si l'article est archivé (Soft Delete), on interdit la modification
//                 if (currentArticle.deletedAt !== null) {
//                     throw new ForbiddenException(
//                         "Action refusée : Cet article est archivé. Vous devez le restaurer avant de pouvoir le modifier."
//                     );
//                 }

//                 // 3. Mise à jour des informations de l'Article
//                 // On utilise 'undefined' pour que Prisma ignore les champs non fournis dans le DTO
//                 const updatedArticle = await tx.article.update({
//                     where: { id },
//                     data: {
//                         nom: nom ?? undefined,
//                     },
//                     include: {
//                         // On retourne les stocks et catégories actifs pour mettre à jour le front-end
//                         stocks: {
//                             where: {
//                                 deletedAt: null,
//                                 category: { deletedAt: null }
//                             },
//                             include: { category: true }
//                         }
//                     }
//                 });

//                 // 4. Audit Log
//                 await this.logService.createLog({
//                     module: 'STOCK_MODULE',
//                     level: LogLevel.INFO,
//                     userId,
//                     email: userEmail,
//                     action: 'UPDATE_ARTICLE',
//                     message: `Mise à jour article "${currentArticle.nom}" : Nom=${updatedArticle.nom}`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 this.logger.log(`✅ Article "${updatedArticle.nom}" mis à jour avec succès.`);

//                 return {
//                     id: updatedArticle.id,
//                     nom: updatedArticle.nom,
//                     updatedAt: updatedArticle.updatedAt, // Prisma gère ce champ automatiquement
//                     message: "L'article a été mis à jour avec succès."
//                 };
//             });

//         } catch (error) {
//             // Si c'est une erreur que nous avons levée (403, 404), on la laisse passer
//             if (error instanceof HttpException) throw error;

//             this.logger.error(`❌ Échec technique update article ${id} : ${error.message}`);
//             throw new InternalServerErrorException("Une erreur technique empêche la mise à jour de l'article.");
//         }
//     }

//     async softDeleteArticle(id: string, currentUser: any): Promise<DeleteArticleResponseDto> {
//         const userId = currentUser?.sub;

//         return await this.prisma.$transaction(async (tx): Promise<DeleteArticleResponseDto> => {
//             // 1. Récupérer l'article avec ses stocks pour vérification
//             const article = await tx.article.findUnique({
//                 where: { id },
//                 include: { stocks: true }
//             });

//             if (!article) throw new NotFoundException("Article introuvable.");

//             // 2. VÉRIFICATION : Empêcher la suppression s'il reste du stock
//             const stockTotal = article.stocks.reduce((acc, s) => acc + s.quantiteActuelle, 0);
//             if (stockTotal > 0) {
//                 throw new ForbiddenException(
//                     `Impossible de supprimer l'article : il reste ${stockTotal} unités en stock.`
//                 );
//             }

//             const now = new Date();

//             // 3. ACTIONS SYNCHRONISÉES (Cascade de Soft Delete)

//             // A. Soft Delete des lignes de STOCK
//             await tx.articleStock.updateMany({
//                 where: { articleId: id },
//                 data: { deletedAt: now }
//             });

//             // B. Soft Delete des CATÉGORIES (Formats)
//             await tx.category.updateMany({
//                 where: { articleId: id },
//                 data: { deletedAt: now }
//             });

//             // C. Soft Delete de l'ARTICLE
//             const deletedArticle = await tx.article.update({
//                 where: { id },
//                 data: { deletedAt: now }
//             });

//             // 4. AUDIT LOG
//             await this.logService.createLog({
//                 module: 'STOCK_MODULE',
//                 level: LogLevel.WARNING,
//                 userId,
//                 action: 'SOFT_DELETE_ARTICLE',
//                 message: `L'article "${article.nom}" et tous ses formats ont été archivés.`,
//                 state: State.SUCCESS,
//             }, tx);

//             return {
//                 id: deletedArticle.id,
//                 message: `L'article "${article.nom}" et ses dépendances ont été archivés.`,
//                 deletedAt: now
//             };
//         });
//     }

//     async restoreArticle(id: string, currentUser: any): Promise<RestoreArticleResponseDto> {
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         this.logger.log(`♻️ Tentative de restauration de l'article ID: ${id} par ${userEmail}`);

//         try {
//             return await this.prisma.$transaction(async (tx): Promise<RestoreArticleResponseDto> => {
//                 // 1. Vérifier si l'article existe et s'il est réellement archivé
//                 const article = await tx.article.findUnique({
//                     where: { id },
//                     select: { id: true, nom: true, deletedAt: true }
//                 });

//                 if (!article) {
//                     throw new NotFoundException("Article introuvable.");
//                 }

//                 if (article.deletedAt === null) {
//                     throw new BadRequestException("Cet article est déjà actif.");
//                 }

//                 // 2. RESTAURATION EN CASCADE

//                 // A. Restaurer les lignes de STOCK liées
//                 await tx.articleStock.updateMany({
//                     where: { articleId: id },
//                     data: { deletedAt: null }
//                 });

//                 // B. Restaurer les CATÉGORIES (Formats) liées
//                 await tx.category.updateMany({
//                     where: { articleId: id },
//                     data: { deletedAt: null }
//                 });

//                 // C. Restaurer l'ARTICLE lui-même
//                 const restoredArticle = await tx.article.update({
//                     where: { id },
//                     data: { deletedAt: null },
//                     include: {
//                         stocks: {
//                             include: { category: true }
//                         }
//                     }
//                 });

//                 // 3. AUDIT LOG
//                 await this.logService.createLog({
//                     module: 'STOCK_MODULE',
//                     level: LogLevel.INFO,
//                     userId,
//                     email: userEmail,
//                     action: 'RESTORE_ARTICLE',
//                     message: `L'article "${restoredArticle.nom}" et tous ses formats ont été restaurés.`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 this.logger.log(`✅ Article "${restoredArticle.nom}" restauré avec succès.`);

//                 // 4. Retourner le DTO de réponse
//                 return {
//                     id: restoredArticle.id,
//                     nom: restoredArticle.nom,
//                     message: "Article et formats associés restaurés avec succès.",
//                     restoredAt: new Date()
//                 };
//             });
//         } catch (error) {
//             if (error instanceof HttpException) throw error;
//             this.logger.error(`❌ Erreur restauration article : ${error.message}`);
//             throw new InternalServerErrorException("Échec de la restauration de l'article.");
//         }
//     }

//     async hardDeleteArticle(id: string, currentUser: any): Promise<HardDeleteResponseDto> {
//         const userId = currentUser?.sub;
//         const userEmail = currentUser?.email;

//         this.logger.warn(`⚠️ TENTATIVE DE SUPPRESSION DÉFINITIVE : Article ID ${id} par ${userEmail}`);

//         try {
//             return await this.prisma.$transaction(async (tx): Promise<HardDeleteResponseDto> => {
//                 // 1. Récupérer l'article avec ses mouvements pour vérification
//                 const article = await tx.article.findUnique({
//                     where: { id },
//                     include: {
//                         _count: {
//                             select: { mouvements: { where: { isSystem: false } } }
//                         }
//                     }
//                 });

//                 if (!article) {
//                     throw new NotFoundException("Article introuvable.");
//                 }

//                 // 2. VÉRIFICATION CRITIQUE : Historique commercial
//                 // Si l'article a des mouvements réels (isSystem: false), on refuse le Hard Delete
//                 if (article._count.mouvements > 0) {
//                     throw new ForbiddenException(
//                         "Suppression définitive impossible : cet article possède un historique de mouvements réels. Utilisez le Soft Delete (archivage) à la place."
//                     );
//                 }

//                 // 3. SUPPRESSION DÉFINITIVE
//                 // Grâce à 'onDelete: Cascade' dans ton Prisma, cela supprimera :
//                 // - Les catégories liées
//                 // - Les lignes de stock liées
//                 // - Les mouvements système liés
//                 await tx.article.delete({
//                     where: { id }
//                 });

//                 // 4. AUDIT LOG (Important de garder une trace de qui a supprimé quoi)
//                 await this.logService.createLog({
//                     module: 'STOCK_MODULE',
//                     level: LogLevel.WARNING,
//                     userId,
//                     email: userEmail,
//                     action: 'HARD_DELETE_ARTICLE',
//                     message: `L'article "${article.nom}" (ID: ${id}) a été supprimé définitivement de la base de données.`,
//                     state: State.SUCCESS,
//                 }, tx);

//                 this.logger.log(`🗑️ Article "${article.nom}" supprimé définitivement.`);

//                 // 5. Retourner le DTO de réponse
//                 return {
//                     deletedId: id,
//                     articleName: article.nom,
//                     message: "L'article et toutes ses données liées ont été supprimés définitivement de la base de données.",
//                     timestamp: new Date()
//                 };
//             });
//         } catch (error) {
//             if (error instanceof HttpException) throw error;
//             this.logger.error(`❌ Erreur hardDelete article : ${error.message}`);
//             throw new InternalServerErrorException("Échec de la suppression définitive.");
//         }
//     }

// } 