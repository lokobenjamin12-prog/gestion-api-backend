"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const mail_service_1 = require("../../authentification/mail/mail.service");
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../../../prisma/prisma.service");
const auth_log_service_1 = require("../../log/auth-log.service");
const fs = __importStar(require("fs"));
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
const EMAIL_TOKEN_EXPIRY_HOURS = 2;
let UserService = UserService_1 = class UserService {
    prisma;
    authLog;
    mailService;
    realtimeGateway;
    constructor(prisma, authLog, mailService, realtimeGateway) {
        this.prisma = prisma;
        this.authLog = authLog;
        this.mailService = mailService;
        this.realtimeGateway = realtimeGateway;
    }
    logger = new common_1.Logger(UserService_1.name);
    async create(dto, actorId, tx) {
        const prisma = tx || this.prisma;
        const email = dto.email.toLowerCase().trim();
        const existing = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        if (existing)
            throw new common_1.ConflictException(`L'email "${email}" est déjà utilisé`);
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const { password, ...rest } = dto;
        const emailToken = crypto.randomBytes(32).toString('hex');
        const emailTokenExpires = new Date(Date.now() + EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        const user = await prisma.user.create({
            data: {
                ...rest,
                email,
                password: hashedPassword,
                emailToken,
                emailTokenExpires,
                status: dto.status || client_1.AccountStatus.PENDING_VERIFICATION,
                dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
                dateRecrutement: dto.dateRecrutement ? new Date(dto.dateRecrutement) : undefined,
            },
            include: this.defaultInclude(),
        });
        await this.authLog.info({
            actorId: actorId || user.id,
            actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'auto-inscription',
            module: client_1.AuthModule.USER,
            action: 'CREATE_USER',
            entityId: user.id,
            entityName: email,
            email,
            apres: { email, roleId: dto.roleId },
            message: `Utilisateur créé par ${actorId ?? 'auto-inscription'} : ${email}`,
        }, prisma);
        return user;
    }
    async createUserByAdmin(dto, actorId) {
        this.logger.log(`👷 --- DÉBUT : CRÉATION ADMIN PAR ${actorId} ---`);
        return await this.prisma.$transaction(async (tx) => {
            const user = await this.create(dto, actorId, tx);
            const activeUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    status: client_1.AccountStatus.ACTIVE,
                    verified: true,
                    emailToken: null,
                },
            });
            await this.authLog.info({
                actorId,
                actorName: await this.authLog.resolveActorName(actorId),
                module: client_1.AuthModule.USER,
                action: 'ADMIN_CREATE_USER',
                entityId: user.id,
                entityName: user.email,
                email: user.email,
                apres: { status: client_1.AccountStatus.ACTIVE, verified: true },
                message: `L'administrateur a créé et activé manuellement le compte : ${user.email}`,
            }, tx);
            try {
                await this.mailService.sendWelcomeEmail(activeUser.email, activeUser.firstName);
            }
            catch (e) {
                this.logger.error(`Mail de bienvenue non envoyé : ${e.message}`);
            }
            this.logger.log(`✅ Compte actif créé pour : ${activeUser.email}`);
            return activeUser;
        });
    }
    async findAll(filters, actorId) {
        const { estArchive, roleId, search, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
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
            this.authLog.info({
                actorId,
                actorName: await this.authLog.resolveActorName(actorId),
                module: client_1.AuthModule.USER,
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
        }
        catch (error) {
            this.authLog.warn({
                actorId,
                module: client_1.AuthModule.USER,
                action: 'FETCH_USER_LIST_FAILED',
                state: client_1.State.FAILED,
                message: `Échec de consultation de la liste des utilisateurs`,
            }).catch(() => { });
            throw new common_1.InternalServerErrorException("Erreur lors de la récupération des utilisateurs");
        }
    }
    async findOne(id, actorId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                include: this.defaultInclude(),
            });
            if (!user) {
                this.authLog.warn({
                    actorId,
                    module: client_1.AuthModule.USER,
                    action: 'FETCH_USER_NOT_FOUND',
                    state: client_1.State.FAILED,
                    message: `Tentative d'accès à l'utilisateur inexistant ID: ${id}`,
                }).catch(() => { });
                throw new common_1.NotFoundException(`Utilisateur #${id} introuvable`);
            }
            this.authLog.info({
                actorId,
                module: client_1.AuthModule.USER,
                action: 'FETCH_USER',
                entityId: user.id,
                entityName: user.email,
                message: `Consultation de la fiche de : ${user.email}`,
            }).catch(err => this.logger.error(`Erreur Log findOne: ${err.message}`));
            return this.sanitizeUser(user);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException(`Erreur lors de la récupération de l'utilisateur`);
        }
    }
    async findByEmail(email, isAuth = false) {
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
        if (!user)
            return null;
        return isAuth ? user : this.sanitizeUser(user);
    }
    async update(id, dto, actorId) {
        const existingUser = await this.findOne(id, actorId);
        if (dto.roleId && dto.roleId !== existingUser.roleId) {
            const role = await this.prisma.role.findUnique({
                where: { id: dto.roleId },
                select: { id: true }
            });
            if (!role)
                throw new common_1.NotFoundException(`Rôle #${dto.roleId} introuvable`);
        }
        const { dateNaissance, dateRecrutement, ...rest } = dto;
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const updatedUser = await tx.user.update({
                    where: { id },
                    data: {
                        ...rest,
                        ...(dateNaissance && { dateNaissance: new Date(dateNaissance) }),
                        ...(dateRecrutement && { dateRecrutement: new Date(dateRecrutement) }),
                    },
                    include: this.defaultInclude(),
                });
                await this.authLog.info({
                    actorId,
                    actorName: await this.authLog.resolveActorName(actorId),
                    module: client_1.AuthModule.USER,
                    action: 'UPDATE_USER',
                    entityId: id,
                    entityName: updatedUser.email,
                    message: `Mise à jour réussie pour l'utilisateur : ${updatedUser.email}`,
                }, tx);
                return this.sanitizeUser(updatedUser);
            });
            this.realtimeGateway.emitEntityChanged({ module: 'user', action: 'updated', id });
            return result;
        }
        catch (error) {
            if (error.status && error.status < 500)
                throw error;
            this.logger.error(`Erreur critique Update User ${id}: ${error.message}`);
            this.authLog.warn({
                actorId,
                module: client_1.AuthModule.USER,
                action: 'UPDATE_USER_FAILED',
                state: client_1.State.FAILED,
                message: `Échec technique lors de la mise à jour de l'utilisateur ${id}`,
            }).catch(() => { });
            throw new common_1.InternalServerErrorException("Une erreur interne est survenue lors de la mise à jour de l'utilisateur");
        }
    }
    async archive(id, actorId) {
        const user = await this.findOne(id, actorId);
        if (user.estArchive) {
            throw new common_1.ConflictException(`L'utilisateur ${user.email} est déjà archivé.`);
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const archived = await tx.user.update({
                    where: { id },
                    data: {
                        estArchive: true,
                        active: false,
                        status: client_1.AccountStatus.ARCHIVED,
                        refreshToken: null,
                        resetPasswordToken: null,
                        emailToken: null,
                    },
                    include: this.defaultInclude(),
                });
                await this.authLog.warn({
                    actorId,
                    actorName: await this.authLog.resolveActorName(actorId),
                    module: client_1.AuthModule.USER,
                    action: 'ARCHIVE_USER',
                    entityId: id,
                    entityName: archived.email,
                    avant: { estArchive: false, active: true, status: user.status },
                    apres: { estArchive: true, active: false, status: client_1.AccountStatus.ARCHIVED },
                    message: `Archivage définitif de l'utilisateur : ${archived.email}`,
                }, tx);
                return this.sanitizeUser(archived);
            });
            this.realtimeGateway.emitEntityChanged({ module: 'user', action: 'updated', id });
            return result;
        }
        catch (error) {
            if (error.status && error.status < 500)
                throw error;
            this.logger.error(`Erreur lors de l'archivage de l'user ${id}: ${error.message}`);
            this.authLog.warn({
                actorId,
                module: client_1.AuthModule.USER,
                action: 'ARCHIVE_USER_FAILED',
                state: client_1.State.FAILED,
                message: `Échec technique lors de l'archivage de l'utilisateur ID: ${id}`,
            }).catch(() => { });
            throw new common_1.InternalServerErrorException("Impossible de procéder à l'archivage");
        }
    }
    async restore(id, actorId) {
        const user = await this.findOne(id, actorId);
        if (!user.estArchive) {
            throw new common_1.ConflictException(`L'utilisateur ${user.email} n'est pas archivé.`);
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const restored = await tx.user.update({
                    where: { id },
                    data: {
                        estArchive: false,
                        active: true,
                        status: client_1.AccountStatus.ACTIVE,
                    },
                    include: this.defaultInclude(),
                });
                await this.authLog.info({
                    actorId,
                    actorName: await this.authLog.resolveActorName(actorId),
                    module: client_1.AuthModule.USER,
                    action: 'RESTORE_USER',
                    entityId: id,
                    entityName: restored.email,
                    avant: { estArchive: true, active: false },
                    apres: { estArchive: false, active: true, status: client_1.AccountStatus.ACTIVE },
                    message: `Restauration du compte de l'utilisateur : ${restored.email}`,
                }, tx);
                return this.sanitizeUser(restored);
            });
            this.realtimeGateway.emitEntityChanged({ module: 'user', action: 'restored', id });
            return result;
        }
        catch (error) {
            if (error.status && error.status < 500)
                throw error;
            this.logger.error(`Erreur lors de la restauration de l'user ${id}: ${error.message}`);
            this.authLog.warn({
                actorId,
                module: client_1.AuthModule.USER,
                action: 'RESTORE_USER_FAILED',
                state: client_1.State.FAILED,
                message: `Échec technique lors de la restauration de l'utilisateur ID: ${id}`,
            }).catch(() => { });
            throw new common_1.InternalServerErrorException("Erreur lors de la procédure de restauration");
        }
    }
    async getUserLogs(id, page = 1, limit = 20) {
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
    async updateProfilePicture(id, filePath, actorId) {
        const existing = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, profilePicture: true },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Utilisateur #${id} introuvable`);
        const oldPicturePath = existing.profilePicture;
        const updated = await this.prisma.user.update({
            where: { id },
            data: { profilePicture: filePath },
            include: this.defaultInclude(),
        });
        await this.authLog.info({
            actorId,
            actorName: await this.authLog.resolveActorName(actorId),
            module: client_1.AuthModule.USER,
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
            }
            catch {
                this.logger.warn(`Impossible de supprimer l'ancienne photo : ${oldPicturePath}`);
            }
        }
        return this.sanitizeUser(updated);
    }
    sanitizeUser(user) {
        if (!user)
            return null;
        const { password, refreshToken, emailToken, ...safeUser } = user;
        return safeUser;
    }
    defaultInclude() {
        return {
            role: {
                include: {
                    department: true,
                    permissions: { include: { permission: true } },
                },
            },
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_log_service_1.AuthLogService,
        mail_service_1.MailService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], UserService);
//# sourceMappingURL=services.service.js.map