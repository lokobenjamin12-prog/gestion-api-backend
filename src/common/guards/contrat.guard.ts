import {
    CanActivate,
    ExecutionContext,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    REQUIRE_CONTRAT_KEY,
    ContratCheckMode,
} from '../decorators/require-contrat.decorator';
import { ContratType } from '@prisma/client';

@Injectable()
export class ContratGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. Vérifie si la route nécessite un contrat
        const meta = this.reflector.getAllAndOverride<{
            mode: ContratCheckMode;
        }>(REQUIRE_CONTRAT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!meta) return true; // Cas 3 — aucune vérification

        const request = context.switchToHttp().getRequest();
        const actorId = request.user?.sub; // l'admin ou employé connecté
        const targetUserId =              // l'employé cible
            request.body?.userId ||
            request.params?.userId ||
            request.params?.id ||
            request.body?.commercialId ||
            actorId; // si pas de cible explicite = soi-même

        const { mode } = meta;

        // 2. Vérification selon le mode
        if (mode === 'TARGET_ONLY' || mode === 'BOTH') {
            await this.assertContratActif(targetUserId, 'employé cible');
        }

        if (mode === 'ACTOR_ONLY' || mode === 'BOTH') {
            await this.assertContratActif(actorId, 'administrateur');
        }

        return true;
    }

    // ─── Helper : vérifie qu'un contrat actif existe ──────────────────────────
    private async assertContratActif(
        userId: string,
        label: string,
    ): Promise<void> {
        if (!userId) {
            throw new BadRequestException(
                `L'identifiant de l'${label} est requis.`,
            );
        }

        const contrat = await this.prisma.contrat.findFirst({
            where: {
                userId,
                deletedAt: null,
                OR: [
                    { type: ContratType.CDI },
                    {
                        type: ContratType.CDD,
                        dateFin: { gte: new Date() },
                    },
                ],
            },
            select: { id: true, type: true, dateFin: true },
        });

        if (!contrat) {
            throw new BadRequestException(
                `L'${label} ne possède pas de contrat actif. ` +
                `Veuillez d'abord créer un contrat avant d'effectuer cette action.`,
            );
        }
    }
}