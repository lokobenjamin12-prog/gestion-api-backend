import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEntrepriseDto } from '../dto/create-entreprise.dto';
import { UpdateEntrepriseDto } from '../dto/update-entreprise.dto';
import { UpdateLogoDto } from '../dto/update.logo.dto';
import { CommerceLogService } from '../../log/commerce-log.service';
export declare class EntrepriseService {
    private readonly prisma;
    private readonly commerceLog;
    private readonly logger;
    constructor(prisma: PrismaService, commerceLog: CommerceLogService);
    create(dto: CreateEntrepriseDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        adresse: string | null;
        nom: string;
        telephone: string | null;
        logo: string | null;
    }>;
    get(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        adresse: string | null;
        nom: string;
        telephone: string | null;
        logo: string | null;
    }>;
    update(dto: UpdateEntrepriseDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        adresse: string | null;
        nom: string;
        telephone: string | null;
        logo: string | null;
    }>;
    updateLogo(dto: UpdateLogoDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        adresse: string | null;
        nom: string;
        telephone: string | null;
        logo: string | null;
    }>;
    findFirst(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        adresse: string | null;
        nom: string;
        telephone: string | null;
        logo: string | null;
    } | null>;
}
