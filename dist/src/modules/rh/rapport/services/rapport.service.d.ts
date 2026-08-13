import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { PdfGeneratorService } from 'src/modules/admin/pdf-generator/services/pdf-generator.service';
import { ExcelGeneratorService } from 'src/modules/admin/excel-generator/services/excel-generator.service';
import { FilterRapportDto } from '../dto/filter-rapport.dto';
import { CreateRapportDto } from '../dto/create-rapport.dto';
import { EntrepriseService } from 'src/modules/commerce/entreprise/services/entreprise.service';
import { RhLogService } from '../../log/rh-log.service';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';
export declare class RapportService {
    private readonly prisma;
    private readonly pdfGen;
    private readonly excelGen;
    private readonly entrepriseService;
    private readonly rhLog;
    private readonly realtimeGateway;
    private readonly OUTPUT_DIR;
    constructor(prisma: PrismaService, pdfGen: PdfGeneratorService, excelGen: ExcelGeneratorService, entrepriseService: EntrepriseService, rhLog: RhLogService, realtimeGateway: StockRealtimeGateway);
    private readonly MIME_TYPES;
    private readonly DEFAULT_MIME_TYPE;
    generer(dto: CreateRapportDto, actorId: string): Promise<{
        rapport: {
            id: string;
            createdAt: Date;
            estArchive: boolean;
            type: import("@prisma/client").$Enums.RapportType;
            deletedAt: Date | null;
            userId: string | null;
            mois: number | null;
            annee: number | null;
            dateGeneration: Date;
            formatExport: import("@prisma/client").$Enums.ExportFormat;
            fichier: string | null;
            periode: string;
        };
        fichier: string;
        avertissement: any;
    }>;
    getStream(id: string): Promise<{
        stream: fs.ReadStream;
        filename: string;
        mimeType: string;
    }>;
    findAll(filters?: FilterRapportDto): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            estArchive: boolean;
            type: import("@prisma/client").$Enums.RapportType;
            deletedAt: Date | null;
            userId: string | null;
            mois: number | null;
            annee: number | null;
            dateGeneration: Date;
            formatExport: import("@prisma/client").$Enums.ExportFormat;
            fichier: string | null;
            periode: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pagesTotales: number;
        };
    }>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        estArchive: boolean;
        type: import("@prisma/client").$Enums.RapportType;
        deletedAt: Date | null;
        userId: string | null;
        mois: number | null;
        annee: number | null;
        dateGeneration: Date;
        formatExport: import("@prisma/client").$Enums.ExportFormat;
        fichier: string | null;
        periode: string;
    }>;
    softDelete(id: string, actorId: string): Promise<{
        message: string;
    }>;
    restore(id: string, actorId: string): Promise<{
        message: string;
    }>;
    private verifierAvertissementMasseSalariale;
    private verifierCloturePourAvertissement;
    private collectData;
    private genererFichier;
}
