import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';


@Injectable()
export class PermissionsGuard implements CanActivate {
    private readonly logger = new Logger(PermissionsGuard.name);

    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        console.log("required", required)

        // No permission declared → free access (if JWT valid)
        if (!required || required.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            this.logger.log(`❌ ÉCHEC : Aucun utilisateur dans la requête.`);
            throw new ForbiddenException('Non authentifié.');
        }

        if (!user.nomrole) {
            this.logger.log(`❌ ÉCHEC : Aucun rôle trouvé dans le payload JWT.`);
            throw new ForbiddenException('Le jeton ne contient aucune information de rôle valide.');
        }

        // Load role + permissions from DB
        this.logger.log(`🔍 Chargement des permissions pour le rôle: ${user.nomrole}`);
        const role = await this.prisma.role.findUnique({
            where: { nomRole: user.nomrole },
            include: {
                permissions: {
                    include: { permission: true },
                },
            },
        });

        if (!role) {
            this.logger.log(`❌ ÉCHEC : Rôle introuvable en base: ${user.nomrole}`);
            throw new ForbiddenException('Rôle introuvable.');
        }

        // Extract permission slugs
        const userSlugs = role.permissions.map((rp) => rp.permission.slug.toLowerCase());
        const requiredLower = required.map((slug) => slug.toLowerCase());

        console.log("permissions", userSlugs)
        this.logger.log(`✅ Permissions du rôle [${user.nomrole}]: [${userSlugs.join(', ')}]`);
        this.logger.log(`🔐 Permissions requises: [${requiredLower.join(', ')}]`);

        // Super Admin bypass
        if (userSlugs.includes('manage_system')) {
            this.logger.log(`👑 Super Admin détecté — accès total accordé.`);
            return true;
        }

        // Check all required permissions are present
        const missing = required.filter((slug) => !userSlugs.includes(slug));

        if (missing.length > 0) {
            this.logger.log(`🚫 ACCÈS REFUSÉ : Permissions manquantes: [${missing.join(', ')}]`);
            throw new ForbiddenException(
                `Accès refusé. Permissions manquantes : [${missing.join(', ')}]`,
            );
        }

        this.logger.log(`✅ Accès accordé pour le rôle [${user.nomrole}].`);
        return true;
    }
}














// NB: le partterm d'une permission est NomModule_Action
// Exemple: Permissions.GestionUtilisateur
// @Injectable()
// export class PermissionsGuard implements CanActivate {
//     constructor(
//         private readonly reflector: Reflector,
//         private readonly prisma: PrismaService,
//     ) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
//             context.getHandler(),
//             context.getClass(),
//         ]);

//         // Pas de permission déclarée → accès libre (si JWT valide)
//         if (!required || required.length === 0) return true;

//         const request = context.switchToHttp().getRequest();
//         const user = request.user;

//         if (!user) {
//             throw new ForbiddenException('Non authentifié');
//         }

//         // SÉCURITÉ : On s'assure d'avoir au moins le nom du rôle
//         if (!user.nomrole) {
//             throw new ForbiddenException("Le jeton ne contient aucune information de rôle valide.");
//         }

//         // Charger le rôle + permissions en utilisant 'nomRole'
//         const role = await this.prisma.role.findUnique({
//             where: {
//                 nomRole: user.nomrole // <-- Remplacement de 'id' par 'nomRole'
//             },
//             include: {
//                 permissions: {
//                     include: {
//                         permission: true,
//                     },
//                 },
//             },
//         });

//         if (!role) {
//             throw new ForbiddenException('Rôle introuvable');
//         }

//         // Liste des slugs de permissions
//         const userSlugs = role.permissions.map(
//             (rp) => rp.permission.slug,
//         );

//         /**
//          * SUPER ADMIN
//          * Si l'utilisateur possède la permission "Admin",
//          * il a accès à tout.
//          */
//         if (userSlugs.includes('Admin')) {
//             return true;
//         }

//         // Vérifie les permissions requises
//         const missing = required.filter(
//             (slug) => !userSlugs.includes(slug),
//         );

//         if (missing.length > 0) {
//             throw new ForbiddenException(
//                 `Accès refusé. Permissions manquantes : [${missing.join(', ')}]`,
//             );
//         }

//         return true;
//     }
// }

