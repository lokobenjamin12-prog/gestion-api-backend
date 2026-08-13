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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContratGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const require_contrat_decorator_1 = require("../decorators/require-contrat.decorator");
const client_1 = require("@prisma/client");
let ContratGuard = class ContratGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const meta = this.reflector.getAllAndOverride(require_contrat_decorator_1.REQUIRE_CONTRAT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!meta)
            return true;
        const request = context.switchToHttp().getRequest();
        const actorId = request.user?.sub;
        const targetUserId = request.body?.userId ||
            request.params?.userId ||
            request.params?.id ||
            request.body?.commercialId ||
            actorId;
        const { mode } = meta;
        if (mode === 'TARGET_ONLY' || mode === 'BOTH') {
            await this.assertContratActif(targetUserId, 'employé cible');
        }
        if (mode === 'ACTOR_ONLY' || mode === 'BOTH') {
            await this.assertContratActif(actorId, 'administrateur');
        }
        return true;
    }
    async assertContratActif(userId, label) {
        if (!userId) {
            throw new common_1.BadRequestException(`L'identifiant de l'${label} est requis.`);
        }
        const contrat = await this.prisma.contrat.findFirst({
            where: {
                userId,
                deletedAt: null,
                OR: [
                    { type: client_1.ContratType.CDI },
                    {
                        type: client_1.ContratType.CDD,
                        dateFin: { gte: new Date() },
                    },
                ],
            },
            select: { id: true, type: true, dateFin: true },
        });
        if (!contrat) {
            throw new common_1.BadRequestException(`L'${label} ne possède pas de contrat actif. ` +
                `Veuillez d'abord créer un contrat avant d'effectuer cette action.`);
        }
    }
};
exports.ContratGuard = ContratGuard;
exports.ContratGuard = ContratGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], ContratGuard);
//# sourceMappingURL=contrat.guard.js.map