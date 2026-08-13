import { EntrepriseService } from '../services/entreprise.service';
import { CreateEntrepriseDto } from '../dto/create-entreprise.dto';
import { UpdateEntrepriseDto } from '../dto/update-entreprise.dto';
export declare class EntrepriseController {
    private readonly entrepriseService;
    constructor(entrepriseService: EntrepriseService);
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
    uploadLogo(file: Express.Multer.File, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        adresse: string | null;
        nom: string;
        telephone: string | null;
        logo: string | null;
    }>;
}
