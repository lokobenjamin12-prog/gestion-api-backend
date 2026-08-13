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
var RoleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const auth_log_service_1 = require("../../log/auth-log.service");
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
let RoleService = RoleService_1 = class RoleService {
    prisma;
    authLog;
    realtimeGateway;
    constructor(prisma, authLog, realtimeGateway) {
        this.prisma = prisma;
        this.authLog = authLog;
        this.realtimeGateway = realtimeGateway;
    }
    logger = new common_1.Logger(RoleService_1.name);
    buildNomRole(post, departmentName) {
        const normalize = (s) => s.trim().replace(/\s+/g, '_');
        return `${normalize(post)}_${normalize(departmentName)}`;
    }
    async create(dto, actorId) {
        const department = await this.prisma.department.findUnique({
            where: { id: dto.departmentId },
            select: { id: true, name: true },
        });
        if (!department) {
            throw new common_1.NotFoundException(`Département #${dto.departmentId} introuvable`);
        }
        const nomRole = this.buildNomRole(dto.post, department.name);
        const conflict = await this.prisma.role.findUnique({ where: { nomRole } });
        if (conflict) {
            throw new common_1.ConflictException(`Le rôle "${nomRole}" existe déjà pour le poste "${dto.post}" dans le département "${department.name}"`);
        }
        try {
            const newRole = await this.prisma.$transaction(async (tx) => {
                const newRole = await tx.role.create({
                    data: {
                        nomRole,
                        post: dto.post,
                        departmentId: dto.departmentId,
                        permissions: (dto.permissionIds && dto.permissionIds.length > 0)
                            ? {
                                create: dto.permissionIds.map((pId) => ({
                                    permissionId: pId,
                                })),
                            }
                            : undefined,
                    },
                    include: this.defaultInclude(),
                });
                await this.authLog.info({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: client_1.AuthModule.ROLE,
                    action: 'CREATE_ROLE',
                    entityId: String(newRole.id),
                    entityName: nomRole,
                    apres: { nomRole, post: dto.post, departmentId: dto.departmentId },
                    message: `Création du rôle : ${nomRole}`,
                }, tx);
                return newRole;
            });
            this.realtimeGateway.emitEntityChanged({ module: 'role', action: 'created', id: newRole.id });
            return newRole;
        }
        catch (error) {
            if (error.code === 'P2003' || (error.status && error.status < 500)) {
                throw new common_1.BadRequestException("Données invalides ou permissions inexistantes.");
            }
            this.logger.error(`Erreur critique création rôle ${nomRole}: ${error.message}`);
            this.authLog.warn({
                actorId,
                module: client_1.AuthModule.ROLE,
                action: 'CREATE_ROLE_ERROR',
                state: client_1.State.FAILED,
                message: `Échec technique lors de la création du rôle : ${nomRole}`,
            }).catch(() => { });
            throw new common_1.InternalServerErrorException('Une erreur interne est survenue.');
        }
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, departmentId, permissionId } = query;
        const skip = (page - 1) * limit;
        const where = {
            ...(departmentId && { departmentId }),
            ...(permissionId && { permissions: { some: { permissionId } } }),
            ...(search && {
                nomRole: { contains: search, mode: 'insensitive' },
            }),
        };
        try {
            const [total, roles] = await Promise.all([
                this.prisma.role.count({ where }),
                this.prisma.role.findMany({
                    where,
                    skip,
                    take: limit,
                    include: this.defaultInclude(),
                    orderBy: [
                        { nomRole: 'asc' },
                        { createdAt: 'desc' },
                    ],
                }),
            ]);
            return {
                data: roles,
                meta: {
                    total,
                    page,
                    limit,
                    lastPage: Math.ceil(total / limit),
                    hasNextPage: page * limit < total,
                    hasPreviousPage: page > 1,
                },
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération des rôles: ${error.message}`);
            throw new common_1.InternalServerErrorException('Impossible de charger les rôles.');
        }
    }
    async findOne(id) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant ${id} est invalide.`);
        }
        try {
            const role = await this.prisma.role.findUnique({
                where: { id },
                include: this.defaultInclude(),
            });
            if (!role) {
                this.logger.warn(`Tentative d'accès au rôle inexistant ID: ${id}`);
                throw new common_1.NotFoundException(`Le rôle #${id} n'existe pas.`);
            }
            return role;
        }
        catch (error) {
            if (error.status && error.status < 500)
                throw error;
            this.logger.error(`Erreur base de données lors du findOne(${id}): ${error.message}`);
            throw new common_1.InternalServerErrorException("Une erreur est survenue lors de la récupération du rôle.");
        }
    }
    async update(id, dto, actorId) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant ${id} est invalide.`);
        }
        const role = await this.findOne(id);
        let nomRole = role.nomRole;
        if (dto.post !== undefined || dto.departmentId !== undefined) {
            const newPost = dto.post ?? role.post;
            const newDeptId = dto.departmentId ?? role.departmentId;
            const department = await this.prisma.department.findUnique({
                where: { id: newDeptId },
                select: { name: true }
            });
            if (!department) {
                throw new common_1.NotFoundException(`Département #${newDeptId} introuvable`);
            }
            nomRole = this.buildNomRole(newPost, department.name);
            if (nomRole !== role.nomRole) {
                const conflict = await this.prisma.role.findUnique({ where: { nomRole } });
                if (conflict) {
                    throw new common_1.ConflictException(`Le rôle "${nomRole}" existe déjà.`);
                }
            }
        }
        try {
            const updatedRole = await this.prisma.$transaction(async (tx) => {
                const updatedRole = await tx.role.update({
                    where: { id },
                    data: {
                        nomRole,
                        post: dto.post,
                        departmentId: dto.departmentId,
                        ...(dto.permissionIds && {
                            permissions: {
                                deleteMany: {},
                                create: dto.permissionIds.map(pId => ({
                                    permissionId: pId
                                }))
                            }
                        })
                    },
                    include: this.defaultInclude(),
                });
                await this.authLog.warn({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: client_1.AuthModule.ROLE,
                    action: 'UPDATE_ROLE',
                    entityId: String(id),
                    entityName: updatedRole.nomRole,
                    avant: { nomRole: role.nomRole },
                    apres: { nomRole },
                    message: `Mise à jour du rôle : ${role.nomRole} → ${nomRole}`,
                }, tx);
                return updatedRole;
            });
            this.realtimeGateway.emitEntityChanged({ module: 'role', action: 'updated', id });
            return updatedRole;
        }
        catch (error) {
            this.logger.error(`Erreur update rôle ${id}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Erreur lors de la mise à jour du rôle.");
        }
    }
    async syncPermissions(id, dto, actorId) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant ${id} est invalide.`);
        }
        const role = await this.findOne(id);
        try {
            const updatedRole = await this.prisma.$transaction(async (tx) => {
                await tx.rolePermission.deleteMany({
                    where: { roleId: id }
                });
                if (dto.permissionIds.length > 0) {
                    await tx.rolePermission.createMany({
                        data: dto.permissionIds.map((pId) => ({
                            roleId: id,
                            permissionId: pId,
                        })),
                    });
                }
                await this.authLog.warn({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: client_1.AuthModule.ROLE,
                    action: 'SYNC_PERMISSIONS',
                    entityId: String(id),
                    entityName: role.nomRole,
                    apres: { permissionIds: dto.permissionIds },
                    message: `Synchronisation des permissions pour le rôle : ${role.nomRole}`,
                }, tx);
                return await tx.role.findUnique({
                    where: { id },
                    include: this.defaultInclude(),
                });
            });
            if (!updatedRole) {
                throw new common_1.InternalServerErrorException("Le rôle a disparu pendant la synchronisation.");
            }
            this.realtimeGateway.emitEntityChanged({ module: 'role', action: 'updated', id });
            return updatedRole;
        }
        catch (error) {
            this.logger.error(`Erreur syncPermissions rôle ${id}: ${error.message}`);
            if (error.code === 'P2003') {
                throw new common_1.BadRequestException("Une ou plusieurs permissions fournies sont invalides.");
            }
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Échec de la synchronisation des permissions.");
        }
    }
    async addPermissions(id, dto, actorId) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant ${id} est invalide.`);
        }
        const role = await this.findOne(id);
        if (!dto.permissionIds || dto.permissionIds.length === 0) {
            return role;
        }
        try {
            const updatedRole = await this.prisma.$transaction(async (tx) => {
                await tx.rolePermission.createMany({
                    data: dto.permissionIds.map((pId) => ({
                        roleId: id,
                        permissionId: pId,
                    })),
                    skipDuplicates: true,
                });
                await this.authLog.info({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: client_1.AuthModule.ROLE,
                    action: 'ADD_PERMISSIONS',
                    entityId: String(id),
                    entityName: role.nomRole,
                    apres: { added: dto.permissionIds },
                    message: `Ajout de ${dto.permissionIds.length} permissions au rôle : ${role.nomRole}`,
                }, tx);
                return await tx.role.findUnique({
                    where: { id },
                    include: this.defaultInclude(),
                });
            });
            if (!updatedRole) {
                throw new common_1.InternalServerErrorException("Le rôle a disparu pendant l'opération.");
            }
            this.realtimeGateway.emitEntityChanged({ module: 'role', action: 'updated', id });
            return updatedRole;
        }
        catch (error) {
            this.logger.error(`Erreur addPermissions rôle ${id}: ${error.message}`);
            if (error.code === 'P2003') {
                throw new common_1.BadRequestException("Certaines permissions fournies n'existent pas dans le système.");
            }
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Échec de l'ajout des permissions.");
        }
    }
    async removePermissions(id, dto, actorId) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant ${id} est invalide.`);
        }
        const role = await this.findOne(id);
        if (!dto.permissionIds || dto.permissionIds.length === 0) {
            return role;
        }
        try {
            const updatedRole = await this.prisma.$transaction(async (tx) => {
                const deleteResult = await tx.rolePermission.deleteMany({
                    where: {
                        roleId: id,
                        permissionId: { in: dto.permissionIds },
                    },
                });
                await this.authLog.warn({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: client_1.AuthModule.ROLE,
                    action: 'REMOVE_PERMISSIONS',
                    entityId: String(id),
                    entityName: role.nomRole,
                    avant: { removed: dto.permissionIds },
                    message: `${deleteResult.count} permission(s) retirée(s) du rôle : ${role.nomRole}`,
                }, tx);
                return await tx.role.findUnique({
                    where: { id },
                    include: this.defaultInclude(),
                });
            });
            if (!updatedRole) {
                throw new common_1.InternalServerErrorException("Le rôle a disparu pendant l'opération.");
            }
            this.realtimeGateway.emitEntityChanged({ module: 'role', action: 'updated', id });
            return updatedRole;
        }
        catch (error) {
            this.logger.error(`Erreur removePermissions rôle ${id}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Échec du retrait des permissions.");
        }
    }
    async remove(id, actorId) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant ${id} est invalide.`);
        }
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } }
        });
        if (!role)
            throw new common_1.NotFoundException(id);
        if (role._count.users > 0) {
            throw new common_1.ConflictException(`Suppression impossible : ce rôle est actuellement assigné à ${role._count.users} utilisateur(s).`);
        }
        try {
            const deletedRole = await this.prisma.$transaction(async (tx) => {
                await tx.rolePermission.deleteMany({ where: { roleId: id } });
                const deletedRole = await tx.role.delete({
                    where: { id },
                });
                await this.authLog.warn({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: client_1.AuthModule.ROLE,
                    action: 'DELETE_ROLE',
                    entityId: String(id),
                    entityName: role.nomRole,
                    avant: { nomRole: role.nomRole },
                    message: `Suppression définitive du rôle : ${role.nomRole}`,
                }, tx);
                return deletedRole;
            });
            this.realtimeGateway.emitEntityChanged({ module: 'role', action: 'deleted', id });
            return deletedRole;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la suppression du rôle ${id}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Une erreur est survenue lors de la suppression du rôle. Vérifiez les dépendances.");
        }
    }
    defaultInclude() {
        return {
            department: true,
            permissions: {
                include: { permission: true },
            },
            users: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePicture: true,
                    active: true,
                    status: true,
                },
            },
        };
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = RoleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_log_service_1.AuthLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], RoleService);
//# sourceMappingURL=services.service.js.map