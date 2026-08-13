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
var PermissionsGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
let PermissionsGuard = PermissionsGuard_1 = class PermissionsGuard {
    reflector;
    prisma;
    logger = new common_1.Logger(PermissionsGuard_1.name);
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const required = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        console.log("required", required);
        if (!required || required.length === 0)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.log(`❌ ÉCHEC : Aucun utilisateur dans la requête.`);
            throw new common_1.ForbiddenException('Non authentifié.');
        }
        if (!user.nomrole) {
            this.logger.log(`❌ ÉCHEC : Aucun rôle trouvé dans le payload JWT.`);
            throw new common_1.ForbiddenException('Le jeton ne contient aucune information de rôle valide.');
        }
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
            throw new common_1.ForbiddenException('Rôle introuvable.');
        }
        const userSlugs = role.permissions.map((rp) => rp.permission.slug.toLowerCase());
        const requiredLower = required.map((slug) => slug.toLowerCase());
        console.log("permissions", userSlugs);
        this.logger.log(`✅ Permissions du rôle [${user.nomrole}]: [${userSlugs.join(', ')}]`);
        this.logger.log(`🔐 Permissions requises: [${requiredLower.join(', ')}]`);
        if (userSlugs.includes('manage_system')) {
            this.logger.log(`👑 Super Admin détecté — accès total accordé.`);
            return true;
        }
        const missing = required.filter((slug) => !userSlugs.includes(slug));
        if (missing.length > 0) {
            this.logger.log(`🚫 ACCÈS REFUSÉ : Permissions manquantes: [${missing.join(', ')}]`);
            throw new common_1.ForbiddenException(`Accès refusé. Permissions manquantes : [${missing.join(', ')}]`);
        }
        this.logger.log(`✅ Accès accordé pour le rôle [${user.nomrole}].`);
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = PermissionsGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map