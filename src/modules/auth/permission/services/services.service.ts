import {
    Injectable,
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreatePermissionDto } from '../dto/request/permission-create.dto';
import { UpdatePermissionDto } from '../dto/request/permission-update.dto';
import { PermissionFiltersDto } from '../dto/request/permission-filters.dto';
import { AuthModule, Permission, Prisma } from '@prisma/client';
import { AuthLogService } from '../../log/auth-log.service';
import { PaginatedResponse } from '../dto/response/paginated-response';
import { PermissionWithCount } from '../dto/response/permission-with-count';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';

@Injectable()
export class PermissionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly authLog: AuthLogService,  // ← replaced logService
        private readonly realtimeGateway: StockRealtimeGateway,
    ) { }
    private readonly logger = new Logger(PermissionService.name);

    async create(dto: CreatePermissionDto, actorId?: string): Promise<Permission> {
        // 1. NORMALISATION RIGOUREUSE DU SLUG
        // On retire les espaces aux extrémités, on remplace les espaces internes par des underscores
        // et on force la mise en majuscules (ex: "edit-stock " -> "EDIT_STOCK")
        const normalizedSlug = dto.slug
            .trim()
            .replace(/[-\s]+/g, '_')
            .toUpperCase();

        // 2. VÉRIFICATION D'EXISTENCE
        const existing = await this.prisma.permission.findUnique({
            where: { slug: normalizedSlug },
        });

        if (existing) {
            throw new ConflictException(
                `La permission technique "${normalizedSlug}" existe déjà dans le système.`,
            );
        }

        try {
            // 3. TRANSACTION ATOMIQUE (Création + Log d'audit)
            const newPermission = await this.prisma.$transaction(async (tx) => {
                const newPermission = await tx.permission.create({
                    data: {
                        ...dto,
                        slug: normalizedSlug, // On injecte le slug propre
                    },
                });

                // 4. LOG D'AUDIT (Crucial pour la sécurité au CIMAP)
                await this.authLog.info({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: AuthModule.PERMISSION,
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

        } catch (error) {
            this.logger.error(`Échec de la création de la permission ${normalizedSlug}: ${error.message}`);

            if (error.status && error.status < 500) throw error;

            throw new InternalServerErrorException(
                "Une erreur technique est survenue lors de la création de la permission."
            );
        }
    }


    /*async findAll(query: PermissionFiltersDto) {
        const { page = 1, limit = 50, search } = query; // Limite par défaut plus large pour les permissions (50)
        const skip = (page - 1) * limit;

        // 1. FILTRE DYNAMIQUE
        // Permet de chercher une permission par son slug technique ou son libellé
        const where: Prisma.PermissionWhereInput = {
            ...(search && {
                OR: [
                    { slug: { contains: search, mode: 'insensitive' } },
                    // Si tu as un champ 'nom' ou 'description' dans ton modèle, décommente la ligne suivante :
                    // { nom: { contains: search, mode: 'insensitive' } }
                ],
            }),
        };

        try {
            // 2. EXÉCUTION PARALLÈLE DE LA REQUÊTE ET DU COMPTAGE
            const [permissions, total] = await Promise.all([
                this.prisma.permission.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { slug: 'asc' }, // Tri alphabétique propre
                }),
                this.prisma.permission.count({ where }),
            ]);

            // 3. STRUCTURE DE RETOUR STANDARDISÉE POUR FLUTTER
            return {
                data: permissions,
                meta: {
                    total,
                    page,
                    lastPage: Math.ceil(total / limit),
                    limit,
                },
            };
        } catch (error) {
            this.logger.error(`Erreur findAll Permission: ${error.message}`);
            throw new InternalServerErrorException(
                "Une erreur est survenue lors de la récupération des permissions."
            );
        }
    }*/

    async findAll(query: PermissionFiltersDto): Promise<PaginatedResponse<Permission>> {
        const { page = 1, limit = 50, search } = query;
        const skip = (page - 1) * limit;

        // 1. FILTRE DYNAMIQUE
        const where: Prisma.PermissionWhereInput = {
            ...(search && {
                OR: [
                    { slug: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        try {
            // 2. EXÉCUTION PARALLÈLE
            const [total, permissions] = await Promise.all([
                this.prisma.permission.count({ where }),
                this.prisma.permission.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [
                        { slug: 'asc' }, // alphabetical order
                        { createdAt: 'desc' }, // tiebreaker
                    ],
                }),
            ]);

            // 3. RETOUR PAGINÉ
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

        } catch (error) {
            this.logger.error(`Erreur findAll Permission: ${error.message}`);
            throw new InternalServerErrorException(
                'Une erreur est survenue lors de la récupération des permissions.',
            );
        }
    }

    async findOne(id: number): Promise<PermissionWithCount> {
        // 1. GARDE DE SÉCURITÉ PRÉVENTIVE
        // Évite d'interroger la base de données si l'identifiant est mathématiquement impossible
        if (!id || id <= 0) {
            throw new BadRequestException(`L'identifiant de permission #${id} est invalide.`);
        }

        try {
            // 2. RÉCUPÉRATION REQUÊTE OPTIMISÉE
            const permission = await this.prisma.permission.findUnique({
                where: { id },
                include: {
                    // Permet de savoir à combien de rôles cette permission est rattachée
                    _count: {
                        select: { roles: true }
                    }
                }
            });

            // 3. TRAITEMENT DE L'ABSENCE
            if (!permission) {
                throw new NotFoundException(`La permission avec l'ID #${id} n'existe pas dans le système.`);
            }

            return permission;

        } catch (error) {
            this.logger.error(`Erreur findOne Permission #${id}: ${error.message}`);

            // On laisse passer les exceptions NestJS (400, 404), on intercepte les pannes brutes (500)
            if (error.status && error.status < 500) throw error;

            throw new InternalServerErrorException(
                "Une erreur technique est survenue lors de la récupération de la permission."
            );
        }
    }

    async findBySlug(slug: string): Promise<PermissionWithCount> {
        // 1. GARDE DE SÉCURITÉ ET NORMALISATION
        if (!slug || slug.trim() === '') {
            throw new BadRequestException("Le slug de la permission ne peut pas être vide.");
        }

        // On nettoie les espaces et on force les majuscules pour correspondre au format stocké
        const normalizedSlug = slug.trim().toUpperCase();

        try {
            // 2. REQUÊTE OPTIMISÉE AVEC COMPTAGE DES RÔLES
            const permission = await this.prisma.permission.findUnique({
                where: { slug: normalizedSlug },
                include: {
                    _count: {
                        select: { roles: true } // Permet de savoir si cette permission est utilisée
                    }
                }
            });

            // 3. GESTION DE L'ABSENCE
            if (!permission) {
                throw new NotFoundException(`La permission système "${normalizedSlug}" n'existe pas.`);
            }

            return permission;

        } catch (error) {
            this.logger.error(`Erreur findBySlug Permission [${normalizedSlug}]: ${error.message}`);

            // On laisse remonter les erreurs de validation ou d'absence (400, 404)
            if (error.status && error.status < 500) throw error;

            throw new InternalServerErrorException(
                "Une erreur technique est survenue lors de la recherche de la permission."
            );
        }
    }

    // async update(id: number, dto: UpdatePermissionDto, actorId?: string) {
    //     // 1. VÉRIFICATION D'EXISTENCE PRÉALABLE
    //     // On récupère l'état actuel pour s'assurer que l'ID existe et pour notre log d'audit
    //     const currentPermission = await this.findOne(id);

    //     // Préparation des données de mise à jour nettoyées
    //     const updateData: Prisma.PermissionUpdateInput = {};

    //     // 2. NORMALISATION ET SÉCURISATION DU SLUG (SI FOURNI)
    //     if (dto.slug) {
    //         const normalizedSlug = dto.slug
    //             .trim()
    //             .replace(/[-\s]+/g, '_')
    //             .toUpperCase();

    //         // Si le slug change réellement par rapport à l'existant
    //         if (normalizedSlug !== currentPermission.slug) {
    //             // Vérification de conflit avec une autre permission
    //             const conflict = await this.prisma.permission.findUnique({
    //                 where: { slug: normalizedSlug },
    //             });

    //             if (conflict) {
    //                 throw new ConflictException(
    //                     `Impossible de modifier : le slug "${normalizedSlug}" est déjà attribué à une autre permission.`,
    //                 );
    //             }
    //             updateData.slug = normalizedSlug;
    //         }
    //     }

    //     // Gestion des autres champs optionnels du DTO (ex: nom, description)
    //     if (dto.description !== undefined) updateData.description = dto.description?.trim();

    //     // 3. GARDE DE PERFORMANCE (Early Return)
    //     // Si aucun champ n'a été modifié après nettoyage, on s'arrête là sans toucher à la base SQL
    //     if (Object.keys(updateData).length === 0) {
    //         return currentPermission;
    //     }

    //     try {
    //         // 4. TRANSACTION ATOMIQUE (Mise à jour + Log d'audit)
    //         return await this.prisma.$transaction(async (tx) => {
    //             const updatedPermission = await tx.permission.update({
    //                 where: { id },
    //                 data: updateData,
    //             });

    //             // 5. LOG D'AUDIT DE SÉCURITÉ (Traçabilité essentielle au CIMAP)
    //             let changeMessage = `Mise à jour de la permission #${id}`;
    //             if (updateData.slug) changeMessage += ` (Slug: ${currentPermission.slug} -> ${updatedPermission.slug})`;

    //             await this.authLog.warn({
    //                 actorId,
    //                 actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
    //                 module: AuthModule.PERMISSION,
    //                 action: 'UPDATE_PERMISSION',
    //                 entityId: String(id),
    //                 entityName: updatedPermission.slug,
    //                 avant: { slug: currentPermission.slug, description: currentPermission.description },
    //                 apres: { slug: updatedPermission.slug, description: updatedPermission.description },
    //                 message: `Mise à jour de la permission #${id}${updateData.slug ? ` (Slug: ${currentPermission.slug} → ${updatedPermission.slug})` : ''}`,
    //             }, tx);

    //             return updatedPermission;
    //         });

    //     } catch (error) {
    //         this.logger.error(`Erreur update Permission #${id}: ${error.message}`);

    //         if (error.status && error.status < 500) throw error;

    //         throw new InternalServerErrorException(
    //             "Une erreur technique est survenue lors de la mise à jour de la permission."
    //         );
    //     }
    // }

    async update(id: number, dto: UpdatePermissionDto, actorId?: string): Promise<PermissionWithCount> {
        // 1. VÉRIFICATION D'EXISTENCE PRÉALABLE
        const currentPermission = await this.findOne(id);

        const updateData: Prisma.PermissionUpdateInput = {};

        // 2. NORMALISATION ET SÉCURISATION DU SLUG (SI FOURNI)
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
                    throw new ConflictException(
                        `Impossible de modifier : le slug "${normalizedSlug}" est déjà attribué à une autre permission.`,
                    );
                }
                updateData.slug = normalizedSlug;
            }
        }

        if (dto.description !== undefined) updateData.description = dto.description?.trim();

        // 3. GARDE DE PERFORMANCE (Early Return)
        if (Object.keys(updateData).length === 0) {
            return currentPermission;
        }

        try {
            // 4. TRANSACTION ATOMIQUE (Mise à jour + Log d'audit)
            const updatedPermission = await this.prisma.$transaction(async (tx) => {
                const updatedPermission = await tx.permission.update({
                    where: { id },
                    data: updateData,
                    include: { _count: { select: { roles: true } } },
                });

                await this.authLog.warn({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: AuthModule.PERMISSION,
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

        } catch (error) {
            this.logger.error(`Erreur update Permission #${id}: ${error.message}`);

            if (error.status && error.status < 500) throw error;

            throw new InternalServerErrorException(
                "Une erreur technique est survenue lors de la mise à jour de la permission."
            );
        }
    }


    async remove(id: number, actorId?: string): Promise<Permission> {
        // 1. On vérifie que la permission existe avant de tenter quoi que ce soit
        const permission = await this.findOne(id);

        try {
            // 2. BLOC TRANSACTIONNEL CRITIQUE
            const deletedPermission = await this.prisma.$transaction(async (tx) => {

                // ÉTAPE A : On délie la permission de tous les rôles (on vide la table pivot)
                // (Ajuste 'rolePermission' selon le nom exact dans ton schema.prisma)
                await tx.rolePermission.deleteMany({
                    where: { permissionId: id },
                });

                // ÉTAPE B : La permission est isolée, on la supprime définitivement
                const deletedPermission = await tx.permission.delete({
                    where: { id },
                });

                // ÉTAPE C : On inscrit l'action dans les logs d'audit du CIMAP
                await this.authLog.warn({
                    actorId,
                    actorName: actorId ? await this.authLog.resolveActorName(actorId) : 'Système',
                    module: AuthModule.PERMISSION,
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

        } catch (error) {
            this.logger.error(`Échec de la suppression/déliaison de la Permission #${id}: ${error.message}`);

            if (error.status && error.status < 500) throw error;

            throw new InternalServerErrorException(
                "Une erreur technique est survenue lors de la suppression de la permission."
            );
        }
    }




    // Seed idempotent des permissions système
    async seedDefaultPermissions() {
        const defaults: { slug: string; description: string }[] = [
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
}