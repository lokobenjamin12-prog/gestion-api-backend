// src/department/department.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { AuditModule, LogLevel, Prisma, RhModule, State } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentFiltersDto } from '../dto/department-filters.dto';
import { RhLogService } from '../../log/rh-log.service';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';


@Injectable()
export class DepartmentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly rhLog: RhLogService,
        private readonly realtimeGateway: StockRealtimeGateway,
    ) { }

    private readonly logger = new Logger(DepartmentService.name);

    // ─── CREATE ───────────────────────────────────────────────────────────────
    async create(dto: CreateDepartmentDto, actorId?: string) {
        const normalizedName = dto.name.trim().toUpperCase();

        const existing = await this.prisma.department.findUnique({
            where: { name: normalizedName },
        });
        if (existing) {
            throw new ConflictException(
                `Le département "${normalizedName}" existe déjà dans le système.`,
            );
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
                    module: RhModule.DEPARTMENT,
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

        } catch (error) {
            this.logger.error(`Échec création département ${normalizedName}: ${error.message}`);
            if (error.status && error.status < 500) throw error;
            throw new InternalServerErrorException(
                'Une erreur technique est survenue lors de la création du département.',
            );
        }
    }

    // ─── FIND ALL ─────────────────────────────────────────────────────────────
    async findAll(query: DepartmentFiltersDto) {
        const { page = 1, limit = 20, search } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.DepartmentWhereInput = {
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

        } catch (error) {
            this.logger.error(`Erreur findAll Department: ${error.message}`);
            throw new InternalServerErrorException('Impossible de récupérer les départements.');
        }
    }

    // ─── FIND ONE ─────────────────────────────────────────────────────────────
    async findOne(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant ${id} est invalide.`);
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
                throw new NotFoundException(`Le département avec l'ID #${id} n'existe pas.`);
            }

            return department;

        } catch (error) {
            this.logger.error(`Erreur findOne Department #${id}: ${error.message}`);
            if (error.status && error.status < 500) throw error;
            throw new InternalServerErrorException('Erreur lors de la récupération du département.');
        }
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    async update(id: number, dto: UpdateDepartmentDto, actorId?: string) {
        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant ${id} est invalide.`);
        }

        const currentDept = await this.findOne(id);
        const updateData: Prisma.DepartmentUpdateInput = {};

        if (dto.name) {
            const normalizedName = dto.name.trim().toUpperCase();
            if (normalizedName !== currentDept.name) {
                const conflict = await this.prisma.department.findUnique({
                    where: { name: normalizedName },
                });
                if (conflict) {
                    throw new ConflictException(
                        `Impossible de renommer : le département "${normalizedName}" existe déjà.`,
                    );
                }
                updateData.name = normalizedName;
            }
        }

        if (Object.keys(updateData).length === 0) return currentDept;

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
                    module: RhModule.DEPARTMENT,
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

        } catch (error) {
            this.logger.error(`Erreur update Department #${id}: ${error.message}`);
            if (error.status && error.status < 500) throw error;
            throw new InternalServerErrorException(
                'Une erreur est survenue lors de la mise à jour du département.',
            );
        }
    }

    // ─── REMOVE ───────────────────────────────────────────────────────────────
    async remove(id: number, actorId?: string) {
        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant ${id} est invalide.`);
        }

        const department = await this.findOne(id);
        const rolesCount = department.roles?.length || 0;

        if (rolesCount > 0) {
            throw new ConflictException(
                `Suppression impossible : le département "${department.name}" est lié à ${rolesCount} rôle(s). ` +
                `Veuillez d'abord supprimer ou déplacer ces rôles.`,
            );
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
                    module: RhModule.DEPARTMENT,
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

        } catch (error) {
            this.logger.error(`Erreur suppression Department #${id}: ${error.message}`);
            if (error.code === 'P2003') {
                throw new ConflictException(
                    "Le département ne peut pas être supprimé car il est référencé par d'autres entités.",
                );
            }
            if (error.status && error.status < 500) throw error;
            throw new InternalServerErrorException(
                'Une erreur technique est survenue lors de la suppression du département.',
            );
        }
    }
}