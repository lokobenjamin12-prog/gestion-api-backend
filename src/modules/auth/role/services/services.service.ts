import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { AuthModule, Prisma, Role, State } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';


import { CreateRoleDto } from 'src/modules/auth/role/dto/request/role-create.dto';
import { UpdateRoleDto } from 'src/modules/auth/role/dto/request/role-update.dto';
import { SyncPermissionsDto } from 'src/modules/auth/role/dto/request/role-sync-permissions.dto';
import { AddRemovePermissionsDto } from 'src/modules/auth/role/dto/request/role-addRemovePermissions.dto';
import { RoleFiltersDto } from '../dto/request/role-filters.dto';
import { AuthLogService } from '../../log/auth-log.service';
import { RoleWithRelations } from '../dto/response/role-with-relations.dto';
import { PaginatedResponse } from '../../permission/dto/response/paginated-response';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';


@Injectable()
export class RoleService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly authLog: AuthLogService,   // ← replaced logService
        private readonly realtimeGateway: StockRealtimeGateway,
    ) { }

    private readonly logger = new Logger(RoleService.name);

    // ─── Règle impérative : nomRole = {post}_{department.name} ───────────────
    // Les espaces sont remplacés par _ pour garantir un slug propre.
    // Exemple : post="Chef Service", department.name="Ressources Humaines"
    //           → "Chef_Service_Ressources_Humaines"
    private buildNomRole(post: string, departmentName: string): string {
        const normalize = (s: string) => s.trim().replace(/\s+/g, '_');
        return `${normalize(post)}_${normalize(departmentName)}`;
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────
    async create(dto: CreateRoleDto, actorId?: string): Promise<RoleWithRelations> {
        // 1. RÉCUPÉRATION DU DÉPARTEMENT
        // On récupère le nom pour construire le nomRole dynamiquement
        const department = await this.prisma.department.findUnique({
            where: { id: dto.departmentId },
            select: { id: true, name: true },
        });

        if (!department) {
            throw new NotFoundException(`Département #${dto.departmentId} introuvable`);
        }

        // 2. GÉNÉRATION ET VÉRIFICATION D'UNICITÉ
        // buildNomRole combine le poste et le département (ex: "DEVELOPPEUR_INFORMATIQUE")
        const nomRole = this.buildNomRole(dto.post, department.name);

        const conflict = await this.prisma.role.findUnique({ where: { nomRole } });
        if (conflict) {
            throw new ConflictException(
                `Le rôle "${nomRole}" existe déjà pour le poste "${dto.post}" dans le département "${department.name}"`,
            );
        }

        try {
            // 3. TRANSACTION ATOMIQUE
            const newRole = await this.prisma.$transaction(async (tx) => {
                // Création du rôle et de ses relations (Permissions)
                const newRole = await tx.role.create({
                    data: {
                        nomRole,
                        post: dto.post,
                        departmentId: dto.departmentId,
                        // Gestion sécurisée du tableau optionnel permissionIds
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

                // 4. ENREGISTREMENT DU LOG DE SUCCÈS
                await this.authLog.info({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: AuthModule.ROLE,
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

        } catch (error) {
            // 5. GESTION DES ERREURS

            // Si l'erreur vient d'une contrainte d'intégrité (ex: permissionId inexistant)
            if (error.code === 'P2003' || (error.status && error.status < 500)) {
                throw new BadRequestException("Données invalides ou permissions inexistantes.");
            }

            // Log technique pour le développeur
            this.logger.error(`Erreur critique création rôle ${nomRole}: ${error.message}`);

            // Log de l'échec en base (Hors transaction)
            this.authLog.warn({
                actorId,
                module: AuthModule.ROLE,
                action: 'CREATE_ROLE_ERROR',
                state: State.FAILED,
                message: `Échec technique lors de la création du rôle : ${nomRole}`,
            }).catch(() => { });
            throw new InternalServerErrorException('Une erreur interne est survenue.');
        }
    }

    // ─── FIND ALL ─────────────────────────────────────────────────────────────

    async findAll(query: RoleFiltersDto): Promise<PaginatedResponse<RoleWithRelations>> {
        const { page = 1, limit = 20, search, departmentId, permissionId } = query;
        const skip = (page - 1) * limit;



        // 1. CONSTRUCTION DU FILTRE DYNAMIQUE
        const where: Prisma.RoleWhereInput = {
            ...(departmentId && { departmentId }),
            ...(permissionId && { permissions: { some: { permissionId } } }),
            ...(search && {
                nomRole: { contains: search, mode: 'insensitive' },
            }),
        };

        try {
            // 2. RÉCUPÉRATION PARALLÉLISÉE
            const [total, roles] = await Promise.all([
                this.prisma.role.count({ where }),
                this.prisma.role.findMany({
                    where,
                    skip,
                    take: limit,
                    include: this.defaultInclude(),
                    orderBy: [
                        { nomRole: 'asc' }, // alphabetical order
                        { createdAt: 'desc' }, // tiebreaker
                    ],
                }),
            ]);

            // 3. RETOUR PAGINÉ
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

        } catch (error) {
            this.logger.error(`Erreur lors de la récupération des rôles: ${error.message}`);
            throw new InternalServerErrorException('Impossible de charger les rôles.');
        }
    }

    // ─── FIND ONE ─────────────────────────────────────────────────────────────
    async findOne(id: number): Promise<RoleWithRelations> {
        // 1. VALIDATION PRÉVENTIVE
        // On s'assure que l'ID est un entier positif
        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant ${id} est invalide.`);
        }

        try {
            // 2. RÉCUPÉRATION AVEC GESTION D'ERREUR INTÉGRÉE
            const role = await this.prisma.role.findUnique({
                where: { id },
                include: this.defaultInclude(),
            });

            // 3. VÉRIFICATION D'EXISTENCE
            if (!role) {
                this.logger.warn(`Tentative d'accès au rôle inexistant ID: ${id}`);
                throw new NotFoundException(`Le rôle #${id} n'existe pas.`);
            }

            return role;

        } catch (error) {
            // Si c'est une erreur NestJS (400, 404), on la laisse passer
            if (error.status && error.status < 500) throw error;

            // Log technique pour le serveur Windows 10 (invisible pour l'utilisateur)
            this.logger.error(`Erreur base de données lors du findOne(${id}): ${error.message}`);

            throw new InternalServerErrorException("Une erreur est survenue lors de la récupération du rôle.");
        }
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    // Régénère nomRole si post ou departmentId change
    async update(id: number, dto: UpdateRoleDto, actorId?: string): Promise<RoleWithRelations> {

        // 0. GARDE DE SÉCURITÉ SUR L'ID
        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant ${id} est invalide.`);
        }

        // 1. VÉRIFICATION D'EXISTENCE
        const role = await this.findOne(id);

        let nomRole = role.nomRole;

        // 2. RECALCUL DU NOM DU RÔLE (Si nécessaire)
        if (dto.post !== undefined || dto.departmentId !== undefined) {
            const newPost = dto.post ?? role.post;
            const newDeptId = dto.departmentId ?? role.departmentId;

            const department = await this.prisma.department.findUnique({
                where: { id: newDeptId },
                select: { name: true } // Optimisation : on ne récupère que le nom
            });

            if (!department) {
                throw new NotFoundException(`Département #${newDeptId} introuvable`);
            }

            nomRole = this.buildNomRole(newPost, department.name);

            // Vérification de conflit (Exclure l'ID actuel)
            if (nomRole !== role.nomRole) {
                const conflict = await this.prisma.role.findUnique({ where: { nomRole } });
                if (conflict) {
                    throw new ConflictException(`Le rôle "${nomRole}" existe déjà.`);
                }
            }
        }

        try {
            // 3. TRANSACTION POUR MISE À JOUR ET PERMISSIONS
            const updatedRole = await this.prisma.$transaction(async (tx) => {
                const updatedRole = await tx.role.update({
                    where: { id },
                    data: {
                        nomRole,
                        post: dto.post,
                        departmentId: dto.departmentId,
                        // Gestion des permissions (Suppression des anciennes et ajout des nouvelles)
                        ...(dto.permissionIds && {
                            permissions: {
                                deleteMany: {}, // On vide les anciennes relations
                                create: dto.permissionIds.map(pId => ({
                                    permissionId: pId
                                }))
                            }
                        })
                    },
                    include: this.defaultInclude(),
                });

                // 4. LOG D'AUDIT
                await this.authLog.warn({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: AuthModule.ROLE,
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
        } catch (error) {
            this.logger.error(`Erreur update rôle ${id}: ${error.message}`);
            if (error.status && error.status < 500) throw error;
            throw new InternalServerErrorException("Erreur lors de la mise à jour du rôle.");
        }
    }




    async syncPermissions(id: number, dto: SyncPermissionsDto, actorId?: string): Promise<RoleWithRelations> {

        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant ${id} est invalide.`);
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
                    module: AuthModule.ROLE,
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
                throw new InternalServerErrorException("Le rôle a disparu pendant la synchronisation.");
            }

            this.realtimeGateway.emitEntityChanged({ module: 'role', action: 'updated', id });
            return updatedRole;

        } catch (error) {
            this.logger.error(`Erreur syncPermissions rôle ${id}: ${error.message}`);

            if (error.code === 'P2003') {
                throw new BadRequestException("Une ou plusieurs permissions fournies sont invalides.");
            }
            if (error.status && error.status < 500) throw error;

            throw new InternalServerErrorException("Échec de la synchronisation des permissions.");
        }
    }





    async addPermissions(id: number, dto: AddRemovePermissionsDto, actorId?: string): Promise<RoleWithRelations> {

        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant ${id} est invalide.`);
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
                    module: AuthModule.ROLE,
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
                throw new InternalServerErrorException("Le rôle a disparu pendant l'opération.");
            }

            this.realtimeGateway.emitEntityChanged({ module: 'role', action: 'updated', id });
            return updatedRole;

        } catch (error) {
            this.logger.error(`Erreur addPermissions rôle ${id}: ${error.message}`);

            if (error.code === 'P2003') {
                throw new BadRequestException("Certaines permissions fournies n'existent pas dans le système.");
            }
            if (error.status && error.status < 500) throw error;

            throw new InternalServerErrorException("Échec de l'ajout des permissions.");
        }
    }



    async removePermissions(id: number, dto: AddRemovePermissionsDto, actorId?: string): Promise<RoleWithRelations> {

        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant ${id} est invalide.`);
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
                    module: AuthModule.ROLE,
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
                throw new InternalServerErrorException("Le rôle a disparu pendant l'opération.");
            }

            this.realtimeGateway.emitEntityChanged({ module: 'role', action: 'updated', id });
            return updatedRole;

        } catch (error) {
            this.logger.error(`Erreur removePermissions rôle ${id}: ${error.message}`);

            if (error.status && error.status < 500) throw error;

            throw new InternalServerErrorException("Échec du retrait des permissions.");
        }
    }






    async remove(id: number, actorId?: string): Promise<Role> {

        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant ${id} est invalide.`);
        }

        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } }
        });

        if (!role) throw new NotFoundException(id);

        if (role._count.users > 0) {
            throw new ConflictException(
                `Suppression impossible : ce rôle est actuellement assigné à ${role._count.users} utilisateur(s).`
            );
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
                    module: AuthModule.ROLE,
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
        } catch (error) {
            this.logger.error(`Erreur lors de la suppression du rôle ${id}: ${error.message}`);

            if (error.status && error.status < 500) throw error;

            throw new InternalServerErrorException(
                "Une erreur est survenue lors de la suppression du rôle. Vérifiez les dépendances."
            );
        }
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────
    private defaultInclude() {
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
}