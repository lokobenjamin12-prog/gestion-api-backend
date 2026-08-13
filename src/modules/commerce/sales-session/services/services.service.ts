import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloseSessionDto, OpenSessionDto, SessionSummaryDto } from '../dto/index';
import { GetSessionsFilterDto } from '../dto/request/get-sessions-filter.dto';
import { PaginatedSessionsResponseDto } from '../dto/response/paginated-sessions-response-dto';
import { GetCommercialSessionsDto } from '../dto/request/get-commercial-sessions.dto';
import { CommerceModule, LogLevel, SessionStatus, State, TypeMouvement } from '@prisma/client';
import { CommerceLogService } from '../../log/commerce-log.service';
import { StockRealtimeGateway } from '../../realtime/stock-realtime.gateway';
import { StockUpdatedEvent } from '../../stocks/events/stock-updated.event';

@Injectable()
export class ServicesService {
    private readonly logger = new Logger(ServicesService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly commerceLog: CommerceLogService,
        private readonly stockGateway: StockRealtimeGateway,
    ) { }

    // ─── OPEN SESSION ─────────────────────────────────────────────────────────
    async openSession(
        dto: OpenSessionDto,
        managerId: string,
    ): Promise<SessionSummaryDto> {
        const { commercialId, articleStockId, quantiteDepart } = dto;

        const jourOuverture = (() => {
            if (!dto.jourOuverture) return new Date();
            const parsedDate = new Date(dto.jourOuverture);
            if (typeof dto.jourOuverture === 'string' && !dto.jourOuverture.includes('T')) {
                return new Date(
                    parsedDate.getUTCFullYear(),
                    parsedDate.getUTCMonth(),
                    parsedDate.getUTCDate(),
                    0, 0, 0, 0,
                );
            }
            return parsedDate;
        })();

        const heureDepart = (() => {
            const baseTime = new Date(jourOuverture.getTime());
            if (dto.heureDepart) {
                const [hours, minutes] = dto.heureDepart.split(':').map(Number);
                baseTime.setHours(hours, minutes, 0, 0);
            }
            return baseTime;
        })();

        this.logger.log(
            `[SalesSession] openSession | commercial=${commercialId} | stock=${articleStockId}`,
        );

        const [articleStock, commercial, sessionActive, actorName] = await Promise.all([
            this.prisma.articleStock.findUnique({
                where: { id: articleStockId },
                include: { article: true, category: true },
            }),
            this.prisma.user.findUnique({
                where: { id: commercialId },
                include: { role: true },
            }),
            this.prisma.salesSession.findFirst({
                where: { commercialId, status: SessionStatus.OPEN },
                select: { id: true },
            }),
            this.commerceLog.resolveActorName(managerId), // ← clean
        ]);

        if (!articleStock || articleStock.deletedAt) throw new NotFoundException('Stock introuvable.');
        if (sessionActive) throw new BadRequestException(`Le commercial a déjà une session ouverte (${sessionActive.id}).`);
        if (!commercial?.active) throw new BadRequestException('Commercial invalide ou inactif.');
        if (articleStock.quantiteActuelle < quantiteDepart) {
            throw new BadRequestException(`Stock insuffisant (${articleStock.quantiteActuelle} disponible(s)).`);
        }

        const quantiteApres = articleStock.quantiteActuelle - quantiteDepart;

        let stockUpdate!: StockUpdatedEvent;

        const session = await this.prisma.$transaction(async (tx) => {
            const updatedStock = await tx.articleStock.update({
                where: { id: articleStockId },
                data: {
                    quantiteActuelle: { decrement: quantiteDepart },
                    niveauAlerte: this.computeNiveauAlerte(
                        quantiteApres,
                        articleStock.seuilAlerte,
                        articleStock.seuilCritique,
                    ),
                },
            });

            if (updatedStock.quantiteActuelle < 0) {
                throw new BadRequestException('Le stock est devenu insuffisant durant la transaction.');
            }

            stockUpdate = {
                articleStockId,
                quantite: updatedStock.quantiteActuelle,
                niveauAlerte: updatedStock.niveauAlerte,
            };

            const mouvement = await tx.movementStock.create({
                data: {
                    type: TypeMouvement.SORTIE,
                    quantiteSortieOuEntree: quantiteDepart,
                    motif: `Session terrain : ${commercial.firstName} ${commercial.lastName}`,
                    quantiteAvant: articleStock.quantiteActuelle,
                    quantiteApres: updatedStock.quantiteActuelle,
                    movementDate: heureDepart,
                    isSystem: true,
                    articleStock: { connect: { id: articleStockId } },
                    article: { connect: { id: articleStock.articleId } },
                    user: { connect: { id: managerId } },
                },
            });

            const newSession = await tx.salesSession.create({
                data: {
                    commercialId,
                    managerId,
                    articleStockId,
                    quantiteDepart,
                    heureDepart,
                    jourOuverture,
                    mouvementDepartId: mouvement.id,
                },
                include: {
                    commercial: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
                    manager: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
                    articleStock: { include: { article: true, category: true } },
                    depenses: true,
                },
            });

            await this.commerceLog.info({
                actorId: managerId,
                actorName,
                module: CommerceModule.SALES_SESSION,
                action: 'OPEN_SESSION',
                entityId: newSession.id,
                entityName: `Session — ${commercial.firstName} ${commercial.lastName}`,
                apres: {
                    commercialId,
                    articleStockId,
                    quantiteDepart,
                    quantiteApres: updatedStock.quantiteActuelle,
                    heureDepart,
                    jourOuverture,
                },
                message:
                    `Session ${newSession.id} ouverte. ` +
                    `${quantiteDepart} "${articleStock.category.nomUnique}" ` +
                    `confiés à ${commercial.firstName} ${commercial.lastName}. ` +
                    `Stock central : ${articleStock.quantiteActuelle} → ${updatedStock.quantiteActuelle}.`,
                state: State.SUCCESS,
            }, tx);

            return newSession;
        });

        this.stockGateway.emitStockUpdated(stockUpdate);
        this.stockGateway.emitEntityChanged({ module: 'salessession', action: 'created', id: session.id });

        this.logger.log(
            `[SalesSession] openSession | session=${session.id} créée | ` +
            `stock: ${articleStock.quantiteActuelle} → ${quantiteApres}`,
        );

        return this.formatSummary(session);
    }

    // ─── CLOSE SESSION ────────────────────────────────────────────────────────
    async closeSession(
        sessionId: string,
        dto: CloseSessionDto,
        managerId: string,
    ): Promise<SessionSummaryDto> {
        this.logger.log(`[SalesSession] Clôture session ${sessionId} par ${managerId}`);

        const [session, actorName] = await Promise.all([
            this.prisma.salesSession.findUnique({
                where: { id: sessionId },
                include: {
                    commercial: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
                    articleStock: { include: { article: true, category: true } },
                },
            }),
            this.commerceLog.resolveActorName(managerId), // ← clean
        ]);

        if (!session) throw new NotFoundException('Session introuvable.');
        if (session.status === SessionStatus.CANCELLED) {
            throw new BadRequestException(
                'Cette session a été annulée. Elle ne peut plus être clôturée car les stocks ont déjà été réintégrés.',
            );
        }
        if (session.status === SessionStatus.CLOSED) {
            throw new BadRequestException('La session est déjà clôturée.');
        }
        if (dto.quantiteRetour > session.quantiteDepart) {
            throw new BadRequestException(
                `La quantité retournée (${dto.quantiteRetour}) ne peut pas être supérieure à la quantité de départ (${session.quantiteDepart}).`,
            );
        }

        const { articleStock } = session;
        const prixUnite = articleStock.category.prixUnite;
        const quantiteVendue = session.quantiteDepart - dto.quantiteRetour;
        const totalVentesRecues = quantiteVendue * prixUnite;
        const depensesListe = dto.depenses || [];
        const totalDepenses = depensesListe.reduce((sum, d) => sum + d.montant, 0);

        //const heureRetour = dto.heureRetour ? new Date(dto.heureRetour) : new Date();
        const heureRetour = (() => {
            const base = new Date();
            if (dto.heureRetour) {
                const [hours, minutes] = dto.heureRetour.split(':').map(Number);
                base.setHours(hours, minutes, 0, 0);
            }
            return base;
        })();

        if (heureRetour < session.heureDepart) {
            throw new BadRequestException(
                `L'heure de retour (${dto.heureRetour ?? 'maintenant'}) ne peut pas être antérieure à l'heure de départ de la session.`,
            );
        }

        const quantiteAvant = articleStock.quantiteActuelle;
        const quantiteApresRetour = quantiteAvant + dto.quantiteRetour;
        const niveauAlerte = this.computeNiveauAlerte(
            quantiteApresRetour,
            articleStock.seuilAlerte,
            articleStock.seuilCritique,
        );

        this.logger.log(
            `[SalesSession] closeSession | session=${sessionId} | heureRetour=${heureRetour.toISOString()}`,
        );

        let stockUpdate: StockUpdatedEvent | undefined;

        const closed = await this.prisma.$transaction(async (tx) => {
            let mouvementRetourId: string | undefined;

            if (depensesListe.length > 0) {
                await tx.depense.createMany({
                    data: depensesListe.map((d) => ({
                        montant: d.montant,
                        motif: d.motif,
                        salesSessionId: sessionId,
                    })),
                });
            }

            if (dto.quantiteRetour > 0) {
                const mouvementRetour = await tx.movementStock.create({
                    data: {
                        type: TypeMouvement.ENTREE,
                        quantiteSortieOuEntree: dto.quantiteRetour,
                        motif: `Retour session : ${session.commercial.firstName} ${session.commercial.lastName}`,
                        quantiteAvant,
                        quantiteApres: quantiteApresRetour,
                        movementDate: heureRetour,
                        isSystem: true,
                        articleStockId: session.articleStockId,
                        articleId: articleStock.articleId,
                        userId: managerId,
                    },
                });
                mouvementRetourId = mouvementRetour.id;

                const updatedArticleStock = await tx.articleStock.update({
                    where: { id: session.articleStockId },
                    data: { quantiteActuelle: { increment: dto.quantiteRetour }, niveauAlerte },
                });

                stockUpdate = {
                    articleStockId: session.articleStockId,
                    quantite: updatedArticleStock.quantiteActuelle,
                    niveauAlerte: updatedArticleStock.niveauAlerte,
                };
            }

            const closedSession = await tx.salesSession.update({
                where: { id: sessionId },
                data: {
                    status: SessionStatus.CLOSED,
                    quantiteRetour: dto.quantiteRetour,
                    heureRetour,
                    totalVentesRecues,
                    totalDepenses,
                    managerId,
                    ...(mouvementRetourId && { mouvementRetourId }),
                },
                include: {
                    commercial: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
                    manager: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
                    articleStock: { include: { article: true, category: true } },
                    depenses: true,
                },
            });

            await this.commerceLog.info({
                actorId: managerId,
                actorName,
                module: CommerceModule.SALES_SESSION,
                action: 'CLOSE_SESSION',
                entityId: sessionId,
                entityName: `Session — ${session.commercial.firstName} ${session.commercial.lastName}`,
                apres: {
                    quantiteVendue,
                    totalVentesRecues,
                    totalDepenses,
                    nbDepenses: depensesListe.length,
                    heureRetour,
                },
                message:
                    `Clôture session ${sessionId}. ` +
                    `Vendu: ${quantiteVendue} (${totalVentesRecues} FCFA). ` +
                    `Dépenses: ${totalDepenses} FCFA (${depensesListe.length} lignes).`,
                state: State.SUCCESS,
            }, tx);

            return closedSession;
        });

        if (stockUpdate) {
            this.stockGateway.emitStockUpdated(stockUpdate);
        }
        this.stockGateway.emitEntityChanged({ module: 'salessession', action: 'updated', id: sessionId });

        this.logger.log(`[SalesSession] Session ${sessionId} clôturée avec succès.`);
        return this.formatSummary(closed);
    }

    // ─── CANCEL SESSION ───────────────────────────────────────────────────────
    async cancelSession(sessionId: string, managerId: string): Promise<SessionSummaryDto> {
        this.logger.log(`[SalesSession] Annulation de la session ${sessionId} par ${managerId}`);

        const [session, actorName] = await Promise.all([
            this.prisma.salesSession.findUnique({
                where: { id: sessionId },
                include: { articleStock: true },
            }),
            this.commerceLog.resolveActorName(managerId), // ← clean
        ]);

        if (!session) throw new NotFoundException('Session introuvable.');
        if (session.status !== SessionStatus.OPEN) {
            throw new BadRequestException(
                `Impossible d'annuler une session au statut ${session.status}.`,
            );
        }

        let stockUpdate!: StockUpdatedEvent;

        const result = await this.prisma.$transaction(async (tx) => {
            const updatedStock = await tx.articleStock.update({
                where: { id: session.articleStockId },
                data: {
                    quantiteActuelle: { increment: session.quantiteDepart },
                    niveauAlerte: this.computeNiveauAlerte(
                        session.articleStock.quantiteActuelle + session.quantiteDepart,
                        session.articleStock.seuilAlerte,
                        session.articleStock.seuilCritique,
                    ),
                },
            });

            stockUpdate = {
                articleStockId: session.articleStockId,
                quantite: updatedStock.quantiteActuelle,
                niveauAlerte: updatedStock.niveauAlerte,
            };

            const mouvementAnnulation = await tx.movementStock.create({
                data: {
                    type: TypeMouvement.ENTREE,
                    quantiteSortieOuEntree: session.quantiteDepart,
                    motif: `ANNULATION SESSION ${session.id}`,
                    quantiteAvant: session.articleStock.quantiteActuelle,
                    quantiteApres: updatedStock.quantiteActuelle,
                    movementDate: new Date(),
                    isSystem: true,
                    articleStockId: session.articleStockId,
                    articleId: session.articleStock.articleId,
                    userId: managerId,
                },
            });

            const cancelled = await tx.salesSession.update({
                where: { id: sessionId },
                data: {
                    status: SessionStatus.CANCELLED,
                    mouvementRetourId: mouvementAnnulation.id,
                },
                select: this.sessionSelect,
            });

            await this.commerceLog.warn({
                actorId: managerId,
                actorName,
                module: CommerceModule.SALES_SESSION,
                action: 'CANCEL_SESSION',
                entityId: sessionId,
                entityName: `Session ${sessionId}`,
                apres: {
                    status: SessionStatus.CANCELLED,
                    stockReintegre: session.quantiteDepart,
                    stockApres: updatedStock.quantiteActuelle,
                },
                message: `Session ${sessionId} annulée — ${session.quantiteDepart} unités réintégrées en stock.`,
                state: State.SUCCESS,
            }, tx);

            return cancelled;
        });

        this.stockGateway.emitStockUpdated(stockUpdate);
        this.stockGateway.emitEntityChanged({ module: 'salessession', action: 'updated', id: sessionId });

        return this.formatSummary(result);
    }

    // ─── FIND ALL ─────────────────────────────────────────────────────────────
    async findAll(filter: GetSessionsFilterDto): Promise<PaginatedSessionsResponseDto> {
        const { status, jourOuverture, page = 1, limit = 20 } = filter;
        const skip = (page - 1) * limit;

        const whereClause = {
            ...(status
                ? { status }
                : { status: { not: SessionStatus.CANCELLED } }),
            ...(jourOuverture && { jourOuverture: new Date(jourOuverture) }),
        };

        const [total, sessions] = await Promise.all([
            this.prisma.salesSession.count({ where: whereClause }),
            this.prisma.salesSession.findMany({
                where: whereClause,
                select: this.sessionSelect,
                orderBy: [
                    { jourOuverture: 'desc' },
                    { heureDepart: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: Number(limit),
            }),
        ]);

        return {
            data: sessions.map((session) => this.formatSummary(session)),
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                lastPage: Math.ceil(total / limit),
                hasNextPage: Number(page) * Number(limit) < total,
                hasPreviousPage: Number(page) > 1,
            },
        };
    }

    // ─── FIND ONE ─────────────────────────────────────────────────────────────
    async findOne(id: string): Promise<SessionSummaryDto> {
        const session = await this.prisma.salesSession.findUnique({
            where: { id },
            select: this.sessionSelect,
        });

        if (!session) {
            throw new NotFoundException(`La session avec l'ID "${id}" est introuvable.`);
        }

        if (session.status === SessionStatus.CANCELLED) {
            this.logger.warn(`[SalesSession] Consultation d'une session ANNULÉE : ${id}`);
        }

        return this.formatSummary(session);
    }

    // ─── FIND BY COMMERCIAL ───────────────────────────────────────────────────
    async findByCommercial(
        commercialId: string,
        query: GetCommercialSessionsDto,
    ): Promise<PaginatedSessionsResponseDto> {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const whereClause = {
            commercialId,
            status: { not: SessionStatus.CANCELLED },
        };

        const [total, sessions] = await Promise.all([
            this.prisma.salesSession.count({ where: whereClause }),
            this.prisma.salesSession.findMany({
                where: whereClause,
                select: this.sessionSelect,
                orderBy: [
                    { jourOuverture: 'desc' },
                    { heureDepart: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: Number(limit),
            }),
        ]);

        return {
            data: sessions.map((session) => this.formatSummary(session)),
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                lastPage: Math.ceil(total / limit),
                hasNextPage: Number(page) * Number(limit) < total,
                hasPreviousPage: Number(page) > 1,
            },
        };
    }

    // ─── HELPERS ────────────────────────────────────────────────────────────────────────────────────────────────────────
    private get sessionSelect() {
        return {
            id: true,
            status: true,
            quantiteDepart: true,
            quantiteRetour: true,
            heureDepart: true,
            heureRetour: true,
            jourOuverture: true,
            totalVentesRecues: true,
            totalDepenses: true,
            depensesImprevues: true,
            motifDepense: true,
            depenses: true,
            commercial: {
                select: { id: true, firstName: true, lastName: true, profilePicture: true },
            },
            manager: {
                select: { id: true, firstName: true, lastName: true, profilePicture: true },
            },
            articleStock: {
                select: {
                    article: { select: { nom: true } },
                    category: { select: { nomUnique: true, prixUnite: true } },
                },
            },
        };
    }

    private computeNiveauAlerte(
        quantite: number,
        seuilAlerte: number,
        seuilCritique: number,
    ) {
        if (quantite < seuilCritique) return 'CRITIQUE' as const;
        if (quantite < seuilAlerte) return 'ALERTE' as const;
        return 'NORMAL' as const;
    }

    private formatSummary(session: any): SessionSummaryDto {
        const quantiteVendue = session.status === 'CLOSED'
            ? (session.quantiteDepart - (session.quantiteRetour ?? 0))
            : null;

        const chiffreAffaireTheorique = quantiteVendue !== null
            ? quantiteVendue * session.articleStock.category.prixUnite
            : null;

        const ecartCaisse =
            chiffreAffaireTheorique !== null && session.totalVentesRecues !== null
                ? session.totalVentesRecues - chiffreAffaireTheorique
                : null;

        return {
            id: session.id,
            status: session.status,
            commercial: {
                id: session.commercial.id,
                firstName: session.commercial.firstName,
                lastName: session.commercial.lastName,
                profilePicture: session.commercial.profilePicture,
            },
            manager: {
                id: session.manager.id,
                firstName: session.manager.firstName,
                lastName: session.manager.lastName,
                profilePicture: session.manager.profilePicture,
            },
            article: {
                nom: session.articleStock.article.nom,
                categorie: session.articleStock.category.nomUnique,
                prixUnite: session.articleStock.category.prixUnite,
            },
            quantiteDepart: session.quantiteDepart,
            quantiteRetour: session.quantiteRetour ?? null,
            quantiteVendue,
            jourOuverture: session.jourOuverture.toISOString().split('T')[0],
            heureDepart: session.heureDepart,
            heureRetour: session.heureRetour ?? null,
            totalVentesRecues: session.totalVentesRecues ?? null,
            totalDepenses: session.totalDepenses ?? 0,
            depenses: session.depenses ?? [],
            chiffreAffaireTheorique,
            ecartCaisse,
        };
    }
}