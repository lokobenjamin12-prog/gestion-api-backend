// src/entreprise/entreprise.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { CommerceModule } from '@prisma/client';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEntrepriseDto } from '../dto/create-entreprise.dto';
import { UpdateEntrepriseDto } from '../dto/update-entreprise.dto';
import { UpdateLogoDto } from '../dto/update.logo.dto';
import { CommerceLogService } from '../../log/commerce-log.service'; // ← new

@Injectable()
export class EntrepriseService {
    private readonly logger = new Logger(EntrepriseService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly commerceLog: CommerceLogService, // ← replaced AuditService
    ) { }

    // ─── CREATE ───────────────────────────────────────────────────────────────
    async create(dto: CreateEntrepriseDto, actorId: string) {
        if (!actorId) throw new BadRequestException('L identifiant admin est requis');

        const actorName = await this.commerceLog.resolveActorName(actorId);

        return this.prisma.$transaction(async (tx) => {
            const count = await tx.entreprise.count();
            if (count > 0) {
                throw new ConflictException(
                    'Une entreprise est déjà configurée — utilisez PATCH /entreprise pour modifier',
                );
            }

            const entreprise = await tx.entreprise.create({ data: dto });

            await this.commerceLog.warn({
                actorId,
                actorName,
                module: CommerceModule.ENTREPRISE,
                action: 'CREATE_ENTREPRISE',
                entityId: entreprise.id,
                entityName: entreprise.nom,
                apres: {
                    nom: entreprise.nom,
                    adresse: entreprise.adresse,
                    telephone: entreprise.telephone,
                    email: entreprise.email,
                },
                message: `Entreprise "${entreprise.nom}" configurée`,
            }, tx);

            return entreprise;
        });
    }

    // ─── GET ──────────────────────────────────────────────────────────────────
    async get() {
        try {
            return await this.prisma.entreprise.findFirstOrThrow();
        } catch {
            throw new NotFoundException(
                'Aucune entreprise configurée — utilisez POST /entreprise',
            );
        }
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    async update(dto: UpdateEntrepriseDto, actorId: string) {
        if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

        const actorName = await this.commerceLog.resolveActorName(actorId);

        return this.prisma.$transaction(async (tx) => {
            const entreprise = await tx.entreprise.findFirst();
            if (!entreprise) {
                throw new NotFoundException(
                    'Aucune entreprise configurée — utilisez POST /entreprise',
                );
            }

            const { nom, adresse, telephone, email } = entreprise;
            const avant = { nom, adresse, telephone, email };

            const updated = await tx.entreprise.update({
                where: { id: entreprise.id },
                data: dto,
            });

            const apres = {
                nom: updated.nom,
                adresse: updated.adresse,
                telephone: updated.telephone,
                email: updated.email,
            };

            await this.commerceLog.warn({
                actorId,
                actorName,
                module: CommerceModule.ENTREPRISE,
                action: 'UPDATE_ENTREPRISE',
                entityId: entreprise.id,
                entityName: entreprise.nom,
                avant,
                apres,
                message: `Entreprise "${entreprise.nom}" mise à jour`,
            }, tx);

            return updated;
        });
    }

    // ─── UPDATE LOGO ──────────────────────────────────────────────────────────
    async updateLogo(dto: UpdateLogoDto, actorId: string) {
        if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

        const actorName = await this.commerceLog.resolveActorName(actorId);
        let oldLogoPath: string | null = null;

        const updated = await this.prisma.$transaction(async (tx) => {
            const entreprise = await tx.entreprise.findFirst();
            if (!entreprise) {
                throw new NotFoundException(
                    'Aucune entreprise configurée — utilisez POST /entreprise',
                );
            }

            oldLogoPath = entreprise.logo;

            const updatedEntreprise = await tx.entreprise.update({
                where: { id: entreprise.id },
                data: { logo: dto.logo },
            });

            await this.commerceLog.info({
                actorId,
                actorName,
                module: CommerceModule.ENTREPRISE,
                action: 'UPDATE_LOGO_ENTREPRISE',
                entityId: entreprise.id,
                entityName: entreprise.nom,
                avant: { logo: oldLogoPath },
                apres: { logo: dto.logo },
                message: `Logo de l'entreprise "${entreprise.nom}" mis à jour`,
            }, tx);

            return updatedEntreprise;
        });

        if (oldLogoPath) {
            try {
                await fs.promises.access(oldLogoPath);
                await fs.promises.unlink(oldLogoPath);
            } catch {
                this.logger.warn(`Impossible de supprimer l'ancien logo : ${oldLogoPath}`);
            }
        }

        return updated;
    }

    // ─── INTERNAL ─────────────────────────────────────────────────────────────
    async findFirst() {
        return this.prisma.entreprise.findFirst();
    }
}