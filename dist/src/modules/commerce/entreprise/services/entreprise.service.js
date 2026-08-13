"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EntrepriseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrepriseService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const prisma_service_1 = require("../../../../prisma/prisma.service");
const commerce_log_service_1 = require("../../log/commerce-log.service");
let EntrepriseService = EntrepriseService_1 = class EntrepriseService {
    prisma;
    commerceLog;
    logger = new common_1.Logger(EntrepriseService_1.name);
    constructor(prisma, commerceLog) {
        this.prisma = prisma;
        this.commerceLog = commerceLog;
    }
    async create(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException('L identifiant admin est requis');
        const actorName = await this.commerceLog.resolveActorName(actorId);
        return this.prisma.$transaction(async (tx) => {
            const count = await tx.entreprise.count();
            if (count > 0) {
                throw new common_1.ConflictException('Une entreprise est déjà configurée — utilisez PATCH /entreprise pour modifier');
            }
            const entreprise = await tx.entreprise.create({ data: dto });
            await this.commerceLog.warn({
                actorId,
                actorName,
                module: client_1.CommerceModule.ENTREPRISE,
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
    async get() {
        try {
            return await this.prisma.entreprise.findFirstOrThrow();
        }
        catch {
            throw new common_1.NotFoundException('Aucune entreprise configurée — utilisez POST /entreprise');
        }
    }
    async update(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const actorName = await this.commerceLog.resolveActorName(actorId);
        return this.prisma.$transaction(async (tx) => {
            const entreprise = await tx.entreprise.findFirst();
            if (!entreprise) {
                throw new common_1.NotFoundException('Aucune entreprise configurée — utilisez POST /entreprise');
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
                module: client_1.CommerceModule.ENTREPRISE,
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
    async updateLogo(dto, actorId) {
        if (!actorId)
            throw new common_1.BadRequestException("L'identifiant admin est requis");
        const actorName = await this.commerceLog.resolveActorName(actorId);
        let oldLogoPath = null;
        const updated = await this.prisma.$transaction(async (tx) => {
            const entreprise = await tx.entreprise.findFirst();
            if (!entreprise) {
                throw new common_1.NotFoundException('Aucune entreprise configurée — utilisez POST /entreprise');
            }
            oldLogoPath = entreprise.logo;
            const updatedEntreprise = await tx.entreprise.update({
                where: { id: entreprise.id },
                data: { logo: dto.logo },
            });
            await this.commerceLog.info({
                actorId,
                actorName,
                module: client_1.CommerceModule.ENTREPRISE,
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
            }
            catch {
                this.logger.warn(`Impossible de supprimer l'ancien logo : ${oldLogoPath}`);
            }
        }
        return updated;
    }
    async findFirst() {
        return this.prisma.entreprise.findFirst();
    }
};
exports.EntrepriseService = EntrepriseService;
exports.EntrepriseService = EntrepriseService = EntrepriseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_log_service_1.CommerceLogService])
], EntrepriseService);
//# sourceMappingURL=entreprise.service.js.map