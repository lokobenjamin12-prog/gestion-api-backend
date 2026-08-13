import {
    BadRequestException,
    ConflictException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CommerceModule, LogLevel, State, TypeMouvement, TypeSeuil } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    CreateMovementDto,
    GetHistoriqueDto,
    MovementResult,
    StockOverviewItemDto,
    StockAlertResponseDto,
    MovementHistoryResponseDto,
    MovementItemDto,
} from '../../dto/index';
import { CommerceLogService } from '../../../log/commerce-log.service';
import { StockRealtimeGateway } from '../../../realtime/stock-realtime.gateway';

@Injectable()
export class StockService {
    private readonly logger = new Logger(StockService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly commerceLog: CommerceLogService,
        private readonly stockGateway: StockRealtimeGateway,
    ) { }

    // ─── PROCESS MOVEMENT ─────────────────────────────────────────────────────
    async processMovement(
        dto: CreateMovementDto,
        currentUser: any,
    ): Promise<MovementResult> {
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
                    throw new NotFoundException(
                        `Le stock avec l'ID "${articleStockId}" n'existe pas ou est archivé.`,
                    );
                }

                const { article, category } = articleStock;
                const quantiteAvant = Number(articleStock.quantiteActuelle);
                const quantiteSaisie = Number(quantite);

                const quantiteApres = this.computeNewQuantity(type, quantiteAvant, quantiteSaisie, article.nom);
                const niveauApres = this.computeNiveauAlerte(
                    quantiteApres,
                    articleStock.seuilAlerte,
                    articleStock.seuilCritique,
                );

                const updateResult = await tx.articleStock.updateMany({
                    where: { id: articleStockId, quantiteActuelle: quantiteAvant },
                    data: { quantiteActuelle: quantiteApres, niveauAlerte: niveauApres, updatedAt: new Date() },
                });

                if (updateResult.count === 0) {
                    throw new ConflictException(
                        'Le stock a été mis à jour par un autre utilisateur. Veuillez valider à nouveau.',
                    );
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
                    module: CommerceModule.STOCK,
                    action: `MOUVEMENT_${type}`,
                    entityId: movement.id,
                    entityName: `${article.nom} (${category.nomUnique})`,
                    avant: { quantite: quantiteAvant, niveauAlerte: articleStock.niveauAlerte },
                    apres: { quantite: quantiteApres, niveauAlerte: niveauApres },
                    message: `Mouvement ${type} : ${article.nom} (${category.nomUnique}) | ${quantiteAvant} → ${quantiteApres}`,
                    state: State.SUCCESS,
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

        } catch (error) {
            this.logger.error(`❌ Erreur mouvement : ${error.message}`);
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erreur technique lors de la mise à jour du stock.');
        }
    }

    // ─── STOCK OVERVIEW ───────────────────────────────────────────────────────
    async getStockOverview(): Promise<StockOverviewItemDto[]> {
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
                niveauAlerte: s.niveauAlerte as any,
                valeurStock: valeurEstimee,
                alerte: this.buildAlerteStock(s.niveauAlerte, s.article.nom, s.quantiteActuelle),
            };
        });
    }

    // ─── ARTICLES EN ALERTE ───────────────────────────────────────────────────
    async getArticlesEnAlerte(): Promise<StockAlertResponseDto[]> {
        this.logger.log('🚨 Filtrage des stocks : Recherche des niveaux ALERTE et CRITIQUE');

        const stocksEnAlerte = await this.prisma.articleStock.findMany({
            where: {
                niveauAlerte: { in: [TypeSeuil.CRITIQUE, TypeSeuil.ALERTE] },
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
            isUrgent: s.niveauAlerte === TypeSeuil.CRITIQUE,
            messageLogistique:
                s.niveauAlerte === TypeSeuil.CRITIQUE
                    ? `🔴 COMMANDE URGENTE : Il ne reste que ${s.quantiteActuelle} unité(s) de ${s.article.nom} (${s.category.nomUnique})`
                    : `🟠 Réapprovisionnement conseillé : ${s.quantiteActuelle} restants pour ${s.article.nom}.`,
        }));
    }

    // ─── HISTORIQUE MOUVEMENTS ────────────────────────────────────────────────
    async getMouvementsStock(query: GetHistoriqueDto): Promise<MovementHistoryResponseDto> {
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

        const mappedData: MovementItemDto[] = movements.map((m) => ({
            id: m.id,
            type: m.type as any,
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

    // ─── HELPERS ──────────────────────────────────────────────────────────────
    private computeNewQuantity(
        type: TypeMouvement,
        actuelle: number,
        delta: number,
        nom: string,
    ): number {
        switch (type) {
            case TypeMouvement.ENTREE:
                return actuelle + delta;
            case TypeMouvement.SORTIE:
            case TypeMouvement.PERTE:
                if (delta > actuelle) {
                    throw new BadRequestException(
                        `Stock insuffisant pour "${nom}". Dispo: ${actuelle}, Demandé: ${delta}`,
                    );
                }
                return actuelle - delta;
            case TypeMouvement.AJUSTEMENT:
                return delta;
            default:
                throw new BadRequestException('Type de mouvement inconnu');
        }
    }

    private computeNiveauAlerte(
        quantite: number,
        seuilAlerte: number,
        seuilCritique: number,
    ): TypeSeuil {
        if (quantite <= seuilCritique) return TypeSeuil.CRITIQUE;
        if (quantite <= seuilAlerte) return TypeSeuil.ALERTE;
        return TypeSeuil.NORMAL;
    }

    private buildAlerte(
        niveau: TypeSeuil,
        nomArticle: string,
        quantite: number,
    ): { active: boolean; niveau: TypeSeuil; message: string } {
        if (niveau === TypeSeuil.NORMAL) return { active: false, niveau, message: '' };

        const message =
            niveau === TypeSeuil.CRITIQUE
                ? `Stock CRITIQUE pour "${nomArticle}" : ${quantite} unité(s) restante(s). Approvisionnement urgent requis.`
                : `Stock faible pour "${nomArticle}" : ${quantite} unité(s) restante(s). Penser à commander.`;

        return { active: true, niveau, message };
    }

    private buildAlerteStock(niveau: string, nom: string, quantite: number) {
        switch (niveau) {
            case 'CRITICAL':
                return { label: 'Critique', color: '#EF4444', message: `Urgent : ${nom} est presque épuisé (${quantite} restant).` };
            case 'LOW':
                return { label: 'Faible', color: '#F59E0B', message: `Attention : Le stock de ${nom} est en dessous du seuil.` };
            default:
                return { label: 'Normal', color: '#10B981', message: 'Niveau de stock satisfaisant.' };
        }
    }
}
