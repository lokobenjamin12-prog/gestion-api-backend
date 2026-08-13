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
var ServicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const commerce_log_service_1 = require("../../log/commerce-log.service");
const stock_realtime_gateway_1 = require("../../realtime/stock-realtime.gateway");
let ServicesService = ServicesService_1 = class ServicesService {
    prisma;
    commerceLog;
    stockGateway;
    logger = new common_1.Logger(ServicesService_1.name);
    constructor(prisma, commerceLog, stockGateway) {
        this.prisma = prisma;
        this.commerceLog = commerceLog;
        this.stockGateway = stockGateway;
    }
    async openSession(dto, managerId) {
        const { commercialId, articleStockId, quantiteDepart } = dto;
        const jourOuverture = (() => {
            if (!dto.jourOuverture)
                return new Date();
            const parsedDate = new Date(dto.jourOuverture);
            if (typeof dto.jourOuverture === 'string' && !dto.jourOuverture.includes('T')) {
                return new Date(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate(), 0, 0, 0, 0);
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
        this.logger.log(`[SalesSession] openSession | commercial=${commercialId} | stock=${articleStockId}`);
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
                where: { commercialId, status: client_1.SessionStatus.OPEN },
                select: { id: true },
            }),
            this.commerceLog.resolveActorName(managerId),
        ]);
        if (!articleStock || articleStock.deletedAt)
            throw new common_1.NotFoundException('Stock introuvable.');
        if (sessionActive)
            throw new common_1.BadRequestException(`Le commercial a déjà une session ouverte (${sessionActive.id}).`);
        if (!commercial?.active)
            throw new common_1.BadRequestException('Commercial invalide ou inactif.');
        if (articleStock.quantiteActuelle < quantiteDepart) {
            throw new common_1.BadRequestException(`Stock insuffisant (${articleStock.quantiteActuelle} disponible(s)).`);
        }
        const quantiteApres = articleStock.quantiteActuelle - quantiteDepart;
        let stockUpdate;
        const session = await this.prisma.$transaction(async (tx) => {
            const updatedStock = await tx.articleStock.update({
                where: { id: articleStockId },
                data: {
                    quantiteActuelle: { decrement: quantiteDepart },
                    niveauAlerte: this.computeNiveauAlerte(quantiteApres, articleStock.seuilAlerte, articleStock.seuilCritique),
                },
            });
            if (updatedStock.quantiteActuelle < 0) {
                throw new common_1.BadRequestException('Le stock est devenu insuffisant durant la transaction.');
            }
            stockUpdate = {
                articleStockId,
                quantite: updatedStock.quantiteActuelle,
                niveauAlerte: updatedStock.niveauAlerte,
            };
            const mouvement = await tx.movementStock.create({
                data: {
                    type: client_1.TypeMouvement.SORTIE,
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
                module: client_1.CommerceModule.SALES_SESSION,
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
                message: `Session ${newSession.id} ouverte. ` +
                    `${quantiteDepart} "${articleStock.category.nomUnique}" ` +
                    `confiés à ${commercial.firstName} ${commercial.lastName}. ` +
                    `Stock central : ${articleStock.quantiteActuelle} → ${updatedStock.quantiteActuelle}.`,
                state: client_1.State.SUCCESS,
            }, tx);
            return newSession;
        });
        this.stockGateway.emitStockUpdated(stockUpdate);
        this.stockGateway.emitEntityChanged({ module: 'salessession', action: 'created', id: session.id });
        this.logger.log(`[SalesSession] openSession | session=${session.id} créée | ` +
            `stock: ${articleStock.quantiteActuelle} → ${quantiteApres}`);
        return this.formatSummary(session);
    }
    async closeSession(sessionId, dto, managerId) {
        this.logger.log(`[SalesSession] Clôture session ${sessionId} par ${managerId}`);
        const [session, actorName] = await Promise.all([
            this.prisma.salesSession.findUnique({
                where: { id: sessionId },
                include: {
                    commercial: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
                    articleStock: { include: { article: true, category: true } },
                },
            }),
            this.commerceLog.resolveActorName(managerId),
        ]);
        if (!session)
            throw new common_1.NotFoundException('Session introuvable.');
        if (session.status === client_1.SessionStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cette session a été annulée. Elle ne peut plus être clôturée car les stocks ont déjà été réintégrés.');
        }
        if (session.status === client_1.SessionStatus.CLOSED) {
            throw new common_1.BadRequestException('La session est déjà clôturée.');
        }
        if (dto.quantiteRetour > session.quantiteDepart) {
            throw new common_1.BadRequestException(`La quantité retournée (${dto.quantiteRetour}) ne peut pas être supérieure à la quantité de départ (${session.quantiteDepart}).`);
        }
        const { articleStock } = session;
        const prixUnite = articleStock.category.prixUnite;
        const quantiteVendue = session.quantiteDepart - dto.quantiteRetour;
        const totalVentesRecues = quantiteVendue * prixUnite;
        const depensesListe = dto.depenses || [];
        const totalDepenses = depensesListe.reduce((sum, d) => sum + d.montant, 0);
        const heureRetour = (() => {
            const base = new Date();
            if (dto.heureRetour) {
                const [hours, minutes] = dto.heureRetour.split(':').map(Number);
                base.setHours(hours, minutes, 0, 0);
            }
            return base;
        })();
        if (heureRetour < session.heureDepart) {
            throw new common_1.BadRequestException(`L'heure de retour (${dto.heureRetour ?? 'maintenant'}) ne peut pas être antérieure à l'heure de départ de la session.`);
        }
        const quantiteAvant = articleStock.quantiteActuelle;
        const quantiteApresRetour = quantiteAvant + dto.quantiteRetour;
        const niveauAlerte = this.computeNiveauAlerte(quantiteApresRetour, articleStock.seuilAlerte, articleStock.seuilCritique);
        this.logger.log(`[SalesSession] closeSession | session=${sessionId} | heureRetour=${heureRetour.toISOString()}`);
        let stockUpdate;
        const closed = await this.prisma.$transaction(async (tx) => {
            let mouvementRetourId;
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
                        type: client_1.TypeMouvement.ENTREE,
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
                    status: client_1.SessionStatus.CLOSED,
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
                module: client_1.CommerceModule.SALES_SESSION,
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
                message: `Clôture session ${sessionId}. ` +
                    `Vendu: ${quantiteVendue} (${totalVentesRecues} FCFA). ` +
                    `Dépenses: ${totalDepenses} FCFA (${depensesListe.length} lignes).`,
                state: client_1.State.SUCCESS,
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
    async cancelSession(sessionId, managerId) {
        this.logger.log(`[SalesSession] Annulation de la session ${sessionId} par ${managerId}`);
        const [session, actorName] = await Promise.all([
            this.prisma.salesSession.findUnique({
                where: { id: sessionId },
                include: { articleStock: true },
            }),
            this.commerceLog.resolveActorName(managerId),
        ]);
        if (!session)
            throw new common_1.NotFoundException('Session introuvable.');
        if (session.status !== client_1.SessionStatus.OPEN) {
            throw new common_1.BadRequestException(`Impossible d'annuler une session au statut ${session.status}.`);
        }
        let stockUpdate;
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedStock = await tx.articleStock.update({
                where: { id: session.articleStockId },
                data: {
                    quantiteActuelle: { increment: session.quantiteDepart },
                    niveauAlerte: this.computeNiveauAlerte(session.articleStock.quantiteActuelle + session.quantiteDepart, session.articleStock.seuilAlerte, session.articleStock.seuilCritique),
                },
            });
            stockUpdate = {
                articleStockId: session.articleStockId,
                quantite: updatedStock.quantiteActuelle,
                niveauAlerte: updatedStock.niveauAlerte,
            };
            const mouvementAnnulation = await tx.movementStock.create({
                data: {
                    type: client_1.TypeMouvement.ENTREE,
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
                    status: client_1.SessionStatus.CANCELLED,
                    mouvementRetourId: mouvementAnnulation.id,
                },
                select: this.sessionSelect,
            });
            await this.commerceLog.warn({
                actorId: managerId,
                actorName,
                module: client_1.CommerceModule.SALES_SESSION,
                action: 'CANCEL_SESSION',
                entityId: sessionId,
                entityName: `Session ${sessionId}`,
                apres: {
                    status: client_1.SessionStatus.CANCELLED,
                    stockReintegre: session.quantiteDepart,
                    stockApres: updatedStock.quantiteActuelle,
                },
                message: `Session ${sessionId} annulée — ${session.quantiteDepart} unités réintégrées en stock.`,
                state: client_1.State.SUCCESS,
            }, tx);
            return cancelled;
        });
        this.stockGateway.emitStockUpdated(stockUpdate);
        this.stockGateway.emitEntityChanged({ module: 'salessession', action: 'updated', id: sessionId });
        return this.formatSummary(result);
    }
    async findAll(filter) {
        const { status, jourOuverture, page = 1, limit = 20 } = filter;
        const skip = (page - 1) * limit;
        const whereClause = {
            ...(status
                ? { status }
                : { status: { not: client_1.SessionStatus.CANCELLED } }),
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
    async findOne(id) {
        const session = await this.prisma.salesSession.findUnique({
            where: { id },
            select: this.sessionSelect,
        });
        if (!session) {
            throw new common_1.NotFoundException(`La session avec l'ID "${id}" est introuvable.`);
        }
        if (session.status === client_1.SessionStatus.CANCELLED) {
            this.logger.warn(`[SalesSession] Consultation d'une session ANNULÉE : ${id}`);
        }
        return this.formatSummary(session);
    }
    async findByCommercial(commercialId, query) {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const whereClause = {
            commercialId,
            status: { not: client_1.SessionStatus.CANCELLED },
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
    get sessionSelect() {
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
    computeNiveauAlerte(quantite, seuilAlerte, seuilCritique) {
        if (quantite < seuilCritique)
            return 'CRITIQUE';
        if (quantite < seuilAlerte)
            return 'ALERTE';
        return 'NORMAL';
    }
    formatSummary(session) {
        const quantiteVendue = session.status === 'CLOSED'
            ? (session.quantiteDepart - (session.quantiteRetour ?? 0))
            : null;
        const chiffreAffaireTheorique = quantiteVendue !== null
            ? quantiteVendue * session.articleStock.category.prixUnite
            : null;
        const ecartCaisse = chiffreAffaireTheorique !== null && session.totalVentesRecues !== null
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
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = ServicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_log_service_1.CommerceLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], ServicesService);
//# sourceMappingURL=services.service.js.map