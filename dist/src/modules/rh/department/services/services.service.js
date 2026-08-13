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
var DepartmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const rh_log_service_1 = require("../../log/rh-log.service");
const stock_realtime_gateway_1 = require("../../../commerce/realtime/stock-realtime.gateway");
let DepartmentService = DepartmentService_1 = class DepartmentService {
    prisma;
    rhLog;
    realtimeGateway;
    constructor(prisma, rhLog, realtimeGateway) {
        this.prisma = prisma;
        this.rhLog = rhLog;
        this.realtimeGateway = realtimeGateway;
    }
    logger = new common_1.Logger(DepartmentService_1.name);
    async create(dto, actorId) {
        const normalizedName = dto.name.trim().toUpperCase();
        const existing = await this.prisma.department.findUnique({
            where: { name: normalizedName },
        });
        if (existing) {
            throw new common_1.ConflictException(`Le département "${normalizedName}" existe déjà dans le système.`);
        }
        const actorName = actorId
            ? await this.rhLog.resolveActorName(actorId)
            : 'Système';
        try {
            const newDepartment = await this.prisma.$transaction(async (tx) => {
                const newDepartment = await tx.department.create({
                    data: { name: normalizedName },
                });
                await this.rhLog.info({
                    actorId: actorId ?? 'system',
                    actorName,
                    module: client_1.RhModule.DEPARTMENT,
                    action: 'CREATE_DEPARTMENT',
                    entityId: String(newDepartment.id),
                    entityName: newDepartment.name,
                    apres: { name: normalizedName },
                    message: `Création du département : ${normalizedName}`,
                }, tx);
                return newDepartment;
            });
            this.realtimeGateway.emitEntityChanged({ module: 'department', action: 'created', id: newDepartment.id });
            return newDepartment;
        }
        catch (error) {
            this.logger.error(`Échec création département ${normalizedName}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException('Une erreur technique est survenue lors de la création du département.');
        }
    }
    async findAll(query) {
        const { page = 1, limit = 20, search } = query;
        const skip = (page - 1) * limit;
        const where = {
            ...(search && { name: { contains: search, mode: 'insensitive' } }),
        };
        try {
            const [total, departments] = await Promise.all([
                this.prisma.department.count({ where }),
                this.prisma.department.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        roles: {
                            select: {
                                id: true,
                                nomRole: true,
                                post: true,
                                _count: { select: { users: true } },
                            },
                        },
                        _count: { select: { roles: true } },
                    },
                    orderBy: [
                        { name: 'asc' },
                        { createdAt: 'desc' },
                    ],
                }),
            ]);
            return {
                data: departments,
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
            this.logger.error(`Erreur findAll Department: ${error.message}`);
            throw new common_1.InternalServerErrorException('Impossible de récupérer les départements.');
        }
    }
    async findOne(id) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant ${id} est invalide.`);
        }
        try {
            const department = await this.prisma.department.findUnique({
                where: { id },
                include: {
                    roles: {
                        include: {
                            permissions: {
                                include: {
                                    permission: {
                                        select: { id: true, slug: true, description: true },
                                    },
                                },
                            },
                            _count: { select: { users: true } },
                        },
                        orderBy: { nomRole: 'asc' },
                    },
                    _count: { select: { roles: true } },
                },
            });
            if (!department) {
                throw new common_1.NotFoundException(`Le département avec l'ID #${id} n'existe pas.`);
            }
            return department;
        }
        catch (error) {
            this.logger.error(`Erreur findOne Department #${id}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException('Erreur lors de la récupération du département.');
        }
    }
    async update(id, dto, actorId) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant ${id} est invalide.`);
        }
        const currentDept = await this.findOne(id);
        const updateData = {};
        if (dto.name) {
            const normalizedName = dto.name.trim().toUpperCase();
            if (normalizedName !== currentDept.name) {
                const conflict = await this.prisma.department.findUnique({
                    where: { name: normalizedName },
                });
                if (conflict) {
                    throw new common_1.ConflictException(`Impossible de renommer : le département "${normalizedName}" existe déjà.`);
                }
                updateData.name = normalizedName;
            }
        }
        if (Object.keys(updateData).length === 0)
            return currentDept;
        const actorName = actorId
            ? await this.rhLog.resolveActorName(actorId)
            : 'Système';
        try {
            const updatedDepartment = await this.prisma.$transaction(async (tx) => {
                const updatedDepartment = await tx.department.update({
                    where: { id },
                    data: updateData,
                });
                await this.rhLog.warn({
                    actorId: actorId ?? 'system',
                    actorName,
                    module: client_1.RhModule.DEPARTMENT,
                    action: 'UPDATE_DEPARTMENT',
                    entityId: String(id),
                    entityName: updatedDepartment.name,
                    avant: { name: currentDept.name },
                    apres: { name: updatedDepartment.name },
                    message: `Département #${id} renommé : ${currentDept.name} → ${updatedDepartment.name}`,
                }, tx);
                return updatedDepartment;
            });
            this.realtimeGateway.emitEntityChanged({ module: 'department', action: 'updated', id });
            return updatedDepartment;
        }
        catch (error) {
            this.logger.error(`Erreur update Department #${id}: ${error.message}`);
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException('Une erreur est survenue lors de la mise à jour du département.');
        }
    }
    async remove(id, actorId) {
        if (!id || id <= 0) {
            throw new common_1.BadRequestException(`L'identifiant ${id} est invalide.`);
        }
        const department = await this.findOne(id);
        const rolesCount = department.roles?.length || 0;
        if (rolesCount > 0) {
            throw new common_1.ConflictException(`Suppression impossible : le département "${department.name}" est lié à ${rolesCount} rôle(s). ` +
                `Veuillez d'abord supprimer ou déplacer ces rôles.`);
        }
        const actorName = actorId
            ? await this.rhLog.resolveActorName(actorId)
            : 'Système';
        try {
            const deletedDepartment = await this.prisma.$transaction(async (tx) => {
                const deletedDepartment = await tx.department.delete({ where: { id } });
                await this.rhLog.warn({
                    actorId: actorId ?? 'system',
                    actorName,
                    module: client_1.RhModule.DEPARTMENT,
                    action: 'DELETE_DEPARTMENT',
                    entityId: String(id),
                    entityName: department.name,
                    avant: { name: department.name },
                    message: `Suppression définitive du département : ${department.name}`,
                }, tx);
                return deletedDepartment;
            });
            this.realtimeGateway.emitEntityChanged({ module: 'department', action: 'deleted', id });
            return deletedDepartment;
        }
        catch (error) {
            this.logger.error(`Erreur suppression Department #${id}: ${error.message}`);
            if (error.code === 'P2003') {
                throw new common_1.ConflictException("Le département ne peut pas être supprimé car il est référencé par d'autres entités.");
            }
            if (error.status && error.status < 500)
                throw error;
            throw new common_1.InternalServerErrorException('Une erreur technique est survenue lors de la suppression du département.');
        }
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = DepartmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rh_log_service_1.RhLogService,
        stock_realtime_gateway_1.StockRealtimeGateway])
], DepartmentService);
//# sourceMappingURL=services.service.js.map