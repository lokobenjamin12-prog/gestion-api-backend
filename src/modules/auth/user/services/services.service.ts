// src/user/user.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
//import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { AccountStatus, AuthModule, Prisma, State } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from '../dto/request/user.dto';
import { UserFiltersDto } from '../dto/request/user-filters.dto';
import { PaginatedLogsDto } from '../dto/request/user-paginated-logs.dto';
import { MailService } from 'src/modules/auth/authentification/mail/mail.service';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthLogService } from '../../log/auth-log.service';
import { PaginatedUserResponseDto } from '../dto/response/user-response.dto';
import * as fs from 'fs';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';


const EMAIL_TOKEN_EXPIRY_HOURS = 2;

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly authLog: AuthLogService,  // ← replaced logService

        private readonly mailService: MailService,
        private readonly realtimeGateway: StockRealtimeGateway,
    ) { }

    private readonly logger = new Logger(UserService.name);
    // ─── CREATE ───────────────────────────────────────────────────────────────
    async create(dto: CreateUserDto, actorId?: string, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prisma;
        const email = dto.email.toLowerCase().trim();

        // 1. Vérification de l'email
        const existing = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        if (existing) throw new ConflictException(`L'email "${email}" est déjà utilisé`);

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const { password, ...rest } = dto;

        // 2. Génération des tokens de vérification (logique de ta 1ère fonction)
        const emailToken = crypto.randomBytes(32).toString('hex');
        const emailTokenExpires = new Date(
            Date.now() + EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
        );

        // 3. Création de l'utilisateur avec les tokens
        const user = await prisma.user.create({
            data: {
                ...rest,
                email,
                password: hashedPassword,
                emailToken,                    // ✅ Ajouté
                emailTokenExpires,             // ✅ Ajouté
                status: (dto as any).status || AccountStatus.PENDING_VERIFICATION,
                dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
                dateRecrutement: dto.dateRecrutement ? new Date(dto.dateRecrutement) : undefined,
            },
            include: this.defaultInclude(),
        });

        // 4. Log de création
        await this.authLog.info({
            actorId: actorId || user.id,
            actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'auto-inscription',
            module: AuthModule.USER,
            action: 'CREATE_USER',
            entityId: user.id,
            entityName: email,
            email,
            apres: { email, roleId: dto.roleId },
            message: `Utilisateur créé par ${actorId ?? 'auto-inscription'} : ${email}`,
        }, prisma as any);

        return user;
    }


    async createUserByAdmin(dto: CreateUserDto, actorId: string) {
        this.logger.log(`👷 --- DÉBUT : CRÉATION ADMIN PAR ${actorId} ---`);

        return await this.prisma.$transaction(async (tx) => {
            // 1. Appel de la fonction de base pour la création technique (hachage, vérification email)
            // On passe 'actorId' pour que le log de création soit attribué à l'admin
            const user = await this.create(dto, actorId, tx);

            // 2. Mise à jour immédiate pour valider le compte
            // L'admin crée le compte, donc on considère l'email comme vérifié
            const activeUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    status: AccountStatus.ACTIVE, // On passe de PENDING à ACTIVE
                    verified: true,               // Plus besoin de cliquer sur le lien mail
                    emailToken: null,             // On nettoie le token de vérification
                },
            });

            // 3. Log spécifique à l'action d'administration
            await this.authLog.info({
                actorId,
                actorName: await this.authLog.resolveActorName(actorId),
                module: AuthModule.USER,
                action: 'ADMIN_CREATE_USER',
                entityId: user.id,
                entityName: user.email,
                email: user.email,
                apres: { status: AccountStatus.ACTIVE, verified: true },
                message: `L'administrateur a créé et activé manuellement le compte : ${user.email}`,
            }, tx as any);

            // 4. (Optionnel) Envoi d'un mail de bienvenue simple (pas de lien de vérification)
            try {
                await this.mailService.sendWelcomeEmail(activeUser.email, activeUser.firstName);
            } catch (e) {
                this.logger.error(`Mail de bienvenue non envoyé : ${e.message}`);
            }

            this.logger.log(`✅ Compte actif créé pour : ${activeUser.email}`);
            return activeUser;
        });
    }

    // ─── FIND ALL ─────────────────────────────────────────────────────────────

    async findAll(filters: UserFiltersDto, actorId: string): Promise<PaginatedUserResponseDto> {
        const {
            estArchive,
            roleId,
            search,
            page = 1,
            limit = 10
        } = filters;

        //console.log('DEBUG estArchive:', estArchive, '| typeof:', typeof estArchive); // ← temporaire


        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {};

        if (estArchive !== undefined) {
            where.estArchive = estArchive;
        }

        if (roleId) {
            where.roleId = roleId;
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        try {
            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    include: { role: true },
                    orderBy: [
                        { lastName: 'asc' },
                        { firstName: 'asc' },
                    ],
                }),
                this.prisma.user.count({ where }),
            ]);

            // --- ENREGISTREMENT DU LOG ---
            // On ne bloque pas la réponse pour un log de consultation (pas de await obligatoire ici si tu veux plus de vitesse)
            this.authLog.info({
                actorId,
                actorName: await this.authLog.resolveActorName(actorId),
                module: AuthModule.USER,
                action: 'FETCH_USER_LIST',
                message: `Consultation liste utilisateurs (Page: ${filters.page ?? 1}, Recherche: ${filters.search || 'aucune'})`,
            }).catch(err => this.logger.error(`Erreur log findAll: ${err.message}`));

            const lastPage = Math.ceil(total / limit);

            return {
                data: users.map(user => this.sanitizeUser(user)),
                meta: {
                    total,
                    page,
                    limit,
                    lastPage,
                    hasNextPage: page < lastPage,
                    hasPrevPage: page > 1,
                },
            };
        } catch (error) {
            // Log de l'échec
            this.authLog.warn({
                actorId,
                module: AuthModule.USER,
                action: 'FETCH_USER_LIST_FAILED',
                state: State.FAILED,
                message: `Échec de consultation de la liste des utilisateurs`,
            }).catch(() => { });

            throw new InternalServerErrorException(
                "Erreur lors de la récupération des utilisateurs"
            );
        }
    }

    // ─── FIND ONE ─────────────────────────────────────────────────────────────
    async findOne(id: string, actorId?: string) {
        try {
            // 1. Recherche optimisée
            const user = await this.prisma.user.findUnique({
                where: { id },
                include: this.defaultInclude(),
            });

            // 2. Gestion de l'absence d'utilisateur
            if (!user) {
                // On log la tentative infructueuse (utile pour détecter du "ID guessing")
                this.authLog.warn({
                    actorId,
                    module: AuthModule.USER,
                    action: 'FETCH_USER_NOT_FOUND',
                    state: State.FAILED,
                    message: `Tentative d'accès à l'utilisateur inexistant ID: ${id}`,
                }).catch(() => { });

                throw new NotFoundException(`Utilisateur #${id} introuvable`);
            }

            // 3. Log de succès (Consultation de fiche)
            // On ne bloque pas le retour des données pour l'écriture du log
            this.authLog.info({
                actorId,
                module: AuthModule.USER,
                action: 'FETCH_USER',
                entityId: user.id,
                entityName: user.email,
                message: `Consultation de la fiche de : ${user.email}`,
            }).catch(err => this.logger.error(`Erreur Log findOne: ${err.message}`));

            // 4. Retour sécurisé
            return this.sanitizeUser(user);

        } catch (error) {
            // Si c'est déjà une NotFoundException, on la relance
            if (error instanceof NotFoundException) throw error;

            // Sinon, erreur technique (ex: ID mal formé)
            throw new InternalServerErrorException(
                `Erreur lors de la récupération de l'utilisateur`
            );
        }
    }


    async findByEmail(email: string, isAuth = false) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true },
                        },
                    },
                },
            },
        });

        if (!user) return null;

        // Si ce n'est pas pour une authentification, on nettoie l'objet
        return isAuth ? user : this.sanitizeUser(user);
    }



    // ─── UPDATE ───────────────────────────────────────────────────────────────
    async update(id: string, dto: UpdateUserDto, actorId: string) {
        // 1. VÉRIFICATION D'EXISTENCE (Hors transaction)
        // On utilise findOne qui gère déjà la NotFoundException et le log de consultation.
        const existingUser = await this.findOne(id, actorId);

        // 2. VALIDATION DU RÔLE (Hors transaction)
        // On ne vérifie le rôle en base que s'il est fourni et différent du rôle actuel.
        if (dto.roleId && dto.roleId !== existingUser.roleId) {
            const role = await this.prisma.role.findUnique({
                where: { id: dto.roleId },
                select: { id: true }
            });
            if (!role) throw new NotFoundException(`Rôle #${dto.roleId} introuvable`);
        }

        // 3. PRÉPARATION DES DONNÉES
        const { dateNaissance, dateRecrutement, ...rest } = dto;

        try {
            // 4. TRANSACTION ATOMIQUE
            // Garantit que l'Update et le Log de succès sont indissociables.
            const result = await this.prisma.$transaction(async (tx) => {

                const updatedUser = await tx.user.update({
                    where: { id },
                    data: {
                        ...rest,
                        // On convertit les dates seulement si elles sont présentes dans le DTO
                        ...(dateNaissance && { dateNaissance: new Date(dateNaissance) }),
                        ...(dateRecrutement && { dateRecrutement: new Date(dateRecrutement) }),
                    },
                    include: this.defaultInclude(),
                });

                // 5. ENREGISTREMENT DU LOG DE SUCCÈS
                // On passe 'tx' pour que le log soit annulé si l'update échoue (et vice versa).
                await this.authLog.info({
                    actorId,
                    actorName: await this.authLog.resolveActorName(actorId),
                    module: AuthModule.USER,
                    action: 'UPDATE_USER',
                    entityId: id,
                    entityName: updatedUser.email,
                    message: `Mise à jour réussie pour l'utilisateur : ${updatedUser.email}`,
                }, tx as any);

                // On retourne l'utilisateur nettoyé (sans password/tokens)
                return this.sanitizeUser(updatedUser);
            });

            this.realtimeGateway.emitEntityChanged({ module: 'user', action: 'updated', id });
            return result;

        } catch (error) {
            // 6. GESTION DES ERREURS

            // Si l'erreur est une exception HTTP connue (404, 403, 409...), on la relance.
            if (error.status && error.status < 500) throw error;

            // Log technique pour le développeur dans la console
            this.logger.error(`Erreur critique Update User ${id}: ${error.message}`);

            // Log de l'échec technique en base de données (Hors transaction car elle a échoué)
            this.authLog.warn({
                actorId,
                module: AuthModule.USER,
                action: 'UPDATE_USER_FAILED',
                state: State.FAILED,
                message: `Échec technique lors de la mise à jour de l'utilisateur ${id}`,
            }).catch(() => { });

            // On renvoie une erreur propre au client mobile/web
            throw new InternalServerErrorException(
                "Une erreur interne est survenue lors de la mise à jour de l'utilisateur"
            );
        }
    }

    // ─── ARCHIVER (soft delete) ───────────────────────────────────────────────
    async archive(id: string, actorId: string) {
        // 1. VÉRIFICATION D'EXISTENCE
        // On réutilise findOne pour centraliser la logique de récupération et d'erreur 404.
        const user = await this.findOne(id, actorId);

        // 2. LOGIQUE MÉTIER
        if (user.estArchive) {
            throw new ConflictException(`L'utilisateur ${user.email} est déjà archivé.`);
        }

        try {
            // 3. TRANSACTION ATOMIQUE
            const result = await this.prisma.$transaction(async (tx) => {

                const archived = await tx.user.update({
                    where: { id },
                    data: {
                        estArchive: true,
                        active: false,
                        status: AccountStatus.ARCHIVED,
                        refreshToken: null,       // Déconnecte l'utilisateur
                        resetPasswordToken: null, // Annule toute demande de récupération
                        emailToken: null,         // Annule toute vérification en cours
                    },
                    include: this.defaultInclude(),
                });

                // 4. LOG DE SUCCÈS
                await this.authLog.warn({
                    actorId,
                    actorName: await this.authLog.resolveActorName(actorId),
                    module: AuthModule.USER,
                    action: 'ARCHIVE_USER',
                    entityId: id,
                    entityName: archived.email,
                    avant: { estArchive: false, active: true, status: user.status },
                    apres: { estArchive: true, active: false, status: AccountStatus.ARCHIVED },
                    message: `Archivage définitif de l'utilisateur : ${archived.email}`,
                }, tx as any);
                return this.sanitizeUser(archived);
            });

            this.realtimeGateway.emitEntityChanged({ module: 'user', action: 'updated', id });
            return result;

        } catch (error) {
            // Relancer les erreurs métier (404, 409, etc.)
            if (error.status && error.status < 500) throw error;

            // Log technique en cas de crash base de données
            this.logger.error(`Erreur lors de l'archivage de l'user ${id}: ${error.message}`);

            this.authLog.warn({
                actorId,
                module: AuthModule.USER,
                action: 'ARCHIVE_USER_FAILED',
                state: State.FAILED,
                message: `Échec technique lors de l'archivage de l'utilisateur ID: ${id}`,
            }).catch(() => { });

            throw new InternalServerErrorException("Impossible de procéder à l'archivage");
        }
    }

    // ─── RESTAURER un utilisateur archivé ─────────────────────────────────────
    async restore(id: string, actorId: string) {
        // 1. VÉRIFICATION D'EXISTENCE
        // On utilise findOne pour valider l'ID et enregistrer l'intention de consultation
        const user = await this.findOne(id, actorId);

        // 2. LOGIQUE MÉTIER
        // On s'assure que l'utilisateur est bien dans un état "archivé" avant de restaurer
        if (!user.estArchive) {
            throw new ConflictException(`L'utilisateur ${user.email} n'est pas archivé.`);
        }

        try {
            // 3. TRANSACTION ATOMIQUE
            const result = await this.prisma.$transaction(async (tx) => {

                const restored = await tx.user.update({
                    where: { id },
                    data: {
                        estArchive: false,
                        active: true,
                        status: AccountStatus.ACTIVE,
                        // Note : on ne touche pas au refreshToken ici,
                        // l'utilisateur devra se reconnecter proprement.
                    },
                    include: this.defaultInclude(),
                });

                // 4. LOG DE SUCCÈS
                await this.authLog.info({
                    actorId,
                    actorName: await this.authLog.resolveActorName(actorId),
                    module: AuthModule.USER,
                    action: 'RESTORE_USER',
                    entityId: id,
                    entityName: restored.email,
                    avant: { estArchive: true, active: false },
                    apres: { estArchive: false, active: true, status: AccountStatus.ACTIVE },
                    message: `Restauration du compte de l'utilisateur : ${restored.email}`,
                }, tx as any);

                return this.sanitizeUser(restored);
            });

            this.realtimeGateway.emitEntityChanged({ module: 'user', action: 'restored', id });
            return result;

        } catch (error) {
            // Relancer les erreurs métier (404, 409)
            if (error.status && error.status < 500) throw error;

            this.logger.error(`Erreur lors de la restauration de l'user ${id}: ${error.message}`);

            // Log de l'échec technique
            this.authLog.warn({
                actorId,
                module: AuthModule.USER,
                action: 'RESTORE_USER_FAILED',
                state: State.FAILED,
                message: `Échec technique lors de la restauration de l'utilisateur ID: ${id}`,
            }).catch(() => { });

            throw new InternalServerErrorException("Erreur lors de la procédure de restauration");
        }
    }

    // ─── LOGS de l'utilisateur ────────────────────────────────────────────────

    // async getUserLogs(id: string, page = 1, limit = 20): Promise<PaginatedLogsDto> {
    //     // 1. Vérification d'existence
    //     await this.findOne(id);

    //     const skip = (page - 1) * limit;

    //     // 2. Récupération parallélisée
    //     const [logs, total] = await Promise.all([
    //         this.prisma.authLog.findMany({
    //             where: { actorId: id },
    //             orderBy: { createdAt: 'desc' },
    //             skip,
    //             take: limit,
    //             select: {
    //                 id: true,
    //                 action: true,
    //                 module: true,
    //                 message: true,
    //                 state: true,
    //                 createdAt: true,
    //             },
    //         }),
    //         this.prisma.authLog.count({ where: { actorId: id } }),
    //     ]);

    //     // 3. Retour typé selon le DTO
    //     return {
    //         data: logs, // Prisma retourne déjà le bon format grâce au 'select'
    //         meta: {
    //             total,
    //             page,
    //             lastPage: Math.ceil(total / limit),
    //             limit,
    //         },
    //     };
    // }


    async getUserLogs(id: string, page = 1, limit = 20): Promise<PaginatedLogsDto> {
        await this.findOne(id);

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            this.prisma.authLog.findMany({
                where: { actorId: id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    action: true,
                    module: true,
                    message: true,
                    state: true,
                    createdAt: true,
                },
            }),
            this.prisma.authLog.count({ where: { actorId: id } }),
        ]);

        const lastPage = Math.ceil(total / limit);

        return {
            data: logs,
            meta: {
                total,
                page,
                lastPage,
                limit,
                hasNextPage: page < lastPage,
                hasPrevPage: page > 1,
            },
        };
    }



    async updateProfilePicture(id: string, filePath: string, actorId: string) {
        const existing = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, profilePicture: true },
        });
        if (!existing) throw new NotFoundException(`Utilisateur #${id} introuvable`);

        const oldPicturePath = existing.profilePicture;

        const updated = await this.prisma.user.update({
            where: { id },
            data: { profilePicture: filePath },
            include: this.defaultInclude(),
        });

        await this.authLog.info({
            actorId,
            actorName: await this.authLog.resolveActorName(actorId),
            module: AuthModule.USER,
            action: 'UPDATE_PROFILE_PICTURE',
            entityId: id,
            entityName: updated.email,
            avant: { profilePicture: oldPicturePath },
            apres: { profilePicture: filePath },
            message: `Photo de profil mise à jour pour : ${updated.email}`,
        }).catch(() => { });

        if (oldPicturePath) {
            try {
                await fs.promises.access(oldPicturePath);
                await fs.promises.unlink(oldPicturePath);
            } catch {
                this.logger.warn(`Impossible de supprimer l'ancienne photo : ${oldPicturePath}`);
            }
        }

        return this.sanitizeUser(updated);
    }




    // ─── HELPERS privés ───────────────────────────────────────────────────────

    // Supprimer password et refreshToken de la réponse
    /**
   * Nettoie l'objet utilisateur pour ne pas renvoyer de données sensibles
   */
    private sanitizeUser(user: any) {
        if (!user) return null;
        const { password, refreshToken, emailToken, ...safeUser } = user;
        return safeUser;
    }


    private defaultInclude() {
        return {
            role: {
                include: {
                    department: true,
                    permissions: { include: { permission: true } },
                },
            },
        };
    }

}













