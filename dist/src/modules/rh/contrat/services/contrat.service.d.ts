import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContratDto } from '../dto/create-contrat.dto';
import { UpdateContratDto } from '../dto/update-contrat.dto';
import { GetContratsFilterDto } from '../dto/get-contrats-filter.dto';
import { RhLogService } from '../../log/rh-log.service';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';
export declare class ContratService {
    private readonly prisma;
    private readonly rhLog;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, rhLog: RhLogService, realtimeGateway: StockRealtimeGateway);
    create(dto: CreateContratDto, actorId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
        alertes: {
            id: string;
            createdAt: Date;
            contratId: string;
            delaiJours: number;
            estEnvoyee: boolean;
            envoyeeAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ContratType;
        dateDebut: Date;
        dateFin: Date | null;
        deletedAt: Date | null;
        userId: string;
    }>;
    findAll(filters?: GetContratsFilterDto): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
            };
            alertes: {
                id: string;
                createdAt: Date;
                contratId: string;
                delaiJours: number;
                estEnvoyee: boolean;
                envoyeeAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.ContratType;
            dateDebut: Date;
            dateFin: Date | null;
            deletedAt: Date | null;
            userId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            lastPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
        alertes: {
            id: string;
            createdAt: Date;
            contratId: string;
            delaiJours: number;
            estEnvoyee: boolean;
            envoyeeAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ContratType;
        dateDebut: Date;
        dateFin: Date | null;
        deletedAt: Date | null;
        userId: string;
    }>;
    update(id: string, dto: UpdateContratDto, actorId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
        alertes: {
            id: string;
            createdAt: Date;
            contratId: string;
            delaiJours: number;
            estEnvoyee: boolean;
            envoyeeAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ContratType;
        dateDebut: Date;
        dateFin: Date | null;
        deletedAt: Date | null;
        userId: string;
    }>;
    softDelete(id: string, actorId: string): Promise<{
        message: string;
    }>;
    restore(id: string, actorId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
        alertes: {
            id: string;
            createdAt: Date;
            contratId: string;
            delaiJours: number;
            estEnvoyee: boolean;
            envoyeeAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ContratType;
        dateDebut: Date;
        dateFin: Date | null;
        deletedAt: Date | null;
        userId: string;
    }>;
    getExpirationsProches(delaiJours?: number): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        alertes: {
            id: string;
            createdAt: Date;
            contratId: string;
            delaiJours: number;
            estEnvoyee: boolean;
            envoyeeAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ContratType;
        dateDebut: Date;
        dateFin: Date | null;
        deletedAt: Date | null;
        userId: string;
    })[]>;
    traiterAlertesCDD(): Promise<{
        delai: number;
        nb: number;
    }[]>;
    private traiterDelai;
    private defaultInclude;
    private assertUserActif;
}
