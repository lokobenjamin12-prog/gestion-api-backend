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
var PermissionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const auth_log_service_1 = require("../../log/auth-log.service");
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
let PermissionService = PermissionService_1 = class PermissionService {
    prisma;
    authLog;
    realtimeGateway;
    constructor(prisma, authLog, realtimeGateway) {
        this.prisma = prisma;
        this.authLog = authLog;
        this.realtimeGateway = realtimeGateway;
    }
    logger = new common_1.Logger(PermissionService_1.name);
    async create(dto, actorId) {
        const normalizedSlug = dto.slug
            .trim()
            .replace(/[-\s]+/g, '_')
            .toUpperCase();
        const existing = await this.prisma.permission.findUnique({
            where: { slug: normalizedSlug },
        });
        if (existing) {
            throw new common_1.ConflictException(`La permission technique "${normalizedSlug}" existe déjà dans le système.`);
        }
        try {
            const newPermission = await this.prisma.$transaction(async (tx) => {
                const newPermission = await tx.permission.create({
                    data: {
                        ...dto,
                        slug: normalizedSlug,
                    },
                });
                await this.authLog.info({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: client_1.AuthModule.PERMISSION,
                    action: 'CREATE_PERMISSION',
                    entityId: String(newPermission.id),
                    entityName: normalizedSlug,
                    apres: { slug: normalizedSlug, description: dto.description },
                    message: `Création d'une nouvelle permission système : ${normalizedSlug}`,
                }, tx);
                return newPermission;
            });
            this.realtimeGateway.emitEntityChanged({ module: 'permission', action: 'created', id: newPermission.id });
            return newPermission;
        }
        catch (error) {
            this.logger.error(`Échec de la création de la permission ${normalizedSlug}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Une erreur technique est survenue lors de la création de la permission.");
        }
    }
    async findAll(query) {
        const { page = 1, limit = 50, search } = query;
        const skip = (page - 1) * limit;
        const where = {
            ...(search && {
                OR: [
                    { slug: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        try {
            const [total, permissions] = await Promise.all([
                this.prisma.permission.count({ where }),
                this.prisma.permission.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [
                        { slug: 'asc' },
                        { createdAt: 'desc' },
                    ],
                }),
            ]);
            return {
                data: permissions,
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
            this.logger.error(`Erreur findAll Permission: ${error.message}`);
            throw new common_1.InternalServerErrorException('Une erreur est survenue lors de la récupération des permissions.');
        }
    }
    async findOne(id) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant de permission #${id} est invalide.`);
        }
        try {
            const permission = await this.prisma.permission.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: { roles: true }
                    }
                }
            });
            if (!permission) {
                throw new common_1.NotFoundException(`La permission avec l'ID #${id} n'existe pas dans le système.`);
            }
            return permission;
        }
        catch (error) {
            this.logger.error(`Erreur findOne Permission #${id}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Une erreur technique est survenue lors de la récupération de la permission.");
        }
    }
    async findBySlug(slug) {
        if (!slug || slug.trim() === '') {
            throw new common_1.BadRequestException("Le slug de la permission ne peut pas être vide.");
        }
        const normalizedSlug = slug.trim().toUpperCase();
        try {
            const permission = await this.prisma.permission.findUnique({
                where: { slug: normalizedSlug },
                include: {
                    _count: {
                        select: { roles: true }
                    }
                }
            });
            if (!permission) {
                throw new common_1.NotFoundException(`La permission système "${normalizedSlug}" n'existe pas.`);
            }
            return permission;
        }
        catch (error) {
            this.logger.error(`Erreur findBySlug Permission [${normalizedSlug}]: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Une erreur technique est survenue lors de la recherche de la permission.");
        }
    }
    async update(id, dto, actorId) {
        const currentPermission = await this.findOne(id);
        const updateData = {};
        if (dto.slug) {
            const normalizedSlug = dto.slug
                .trim()
                .replace(/[-\s]+/g, '_')
                .toUpperCase();
            if (normalizedSlug !== currentPermission.slug) {
                const conflict = await this.prisma.permission.findUnique({
                    where: { slug: normalizedSlug },
                });
                if (conflict) {
                    throw new common_1.ConflictException(`Impossible de modifier : le slug "${normalizedSlug}" est déjà attribué à une autre permission.`);
                }
                updateData.slug = normalizedSlug;
            }
        }
        if (dto.description !== undefined)
            updateData.description = dto.description?.trim();
        if (Object.keys(updateData).length === 0) {
            return currentPermission;
        }
        try {
            const updatedPermission = await this.prisma.$transaction(async (tx) => {
                const updatedPermission = await tx.permission.update({
                    where: { id },
                    data: updateData,
                    include: { _count: { select: { roles: true } } },
                });
                await this.authLog.warn({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: client_1.AuthModule.PERMISSION,
                    action: 'UPDATE_PERMISSION',
                    entityId: String(id),
                    entityName: updatedPermission.slug,
                    avant: { slug: currentPermission.slug, description: currentPermission.description },
                    apres: { slug: updatedPermission.slug, description: updatedPermission.description },
                    message: `Mise à jour de la permission #${id}${updateData.slug ? ` (Slug: ${currentPermission.slug} → ${updatedPermission.slug})` : ''}`,
                }, tx);
                return updatedPermission;
            });
            this.realtimeGateway.emitEntityChanged({ module: 'permission', action: 'updated', id });
            return updatedPermission;
        }
        catch (error) {
            this.logger.error(`Erreur update Permission #${id}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Une erreur technique est survenue lors de la mise à jour de la permission.");
        }
    }
    async remove(id, actorId) {
        const permission = await this.findOne(id);
        try {
            const deletedPermission = await this.prisma.$transaction(async (tx) => {
                await tx.rolePermission.deleteMany({
                    where: { permissionId: id },
                });
                const deletedPermission = await tx.permission.delete({
                    where: { id },
                });
                await this.authLog.warn({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: client_1.AuthModule.PERMISSION,
                    action: 'DELETE_PERMISSION',
                    entityId: String(id),
                    entityName: permission.slug,
                    avant: { slug: permission.slug, description: permission.description },
                    message: `Suppression définitive de la permission "${permission.slug}" (détachée de tous les rôles)`,
                }, tx);
                return deletedPermission;
            });
            this.realtimeGateway.emitEntityChanged({ module: 'permission', action: 'deleted', id });
            return deletedPermission;
        }
        catch (error) {
            this.logger.error(`Échec de la suppression/déliaison de la Permission #${id}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException("Une erreur technique est survenue lors de la suppression de la permission.");
        }
    }
    async seedDefaultPermissions() {
        const defaults = [
            { slug: 'employe:create', description: 'Créer un employé' },
            { slug: 'employe:read', description: 'Consulter les employés' },
            { slug: 'employe:update', description: 'Modifier un employé' },
            { slug: 'employe:delete', description: 'Archiver un employé' },
            { slug: 'presence:create', description: 'Enregistrer une présence' },
            { slug: 'presence:read', description: 'Consulter les présences' },
            { slug: 'absence:create', description: 'Déclarer une absence' },
            { slug: 'absence:read', description: 'Consulter les absences' },
            { slug: 'salaire:read', description: 'Consulter les salaires' },
            { slug: 'salaire:compute', description: 'Calculer les salaires' },
            { slug: 'fiche:generate', description: 'Générer les fiches de paie' },
            { slug: 'rapport:export', description: 'Exporter les rapports' },
            { slug: 'config:manage', description: 'Gérer la configuration système' },
            { slug: 'role:manage', description: 'Gérer les rôles et permissions' },
        ];
        for (const perm of defaults) {
            await this.prisma.permission.upsert({
                where: { slug: perm.slug },
                update: { description: perm.description },
                create: perm,
            });
        }
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = PermissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_log_service_1.AuthLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], PermissionService);
//# sourceMappingURL=services.service.js.map