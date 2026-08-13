import { ContratService } from '../services/contrat.service';
import { ContratType } from '@prisma/client';
import { CreateContratDto } from '../dto/create-contrat.dto';
import { UpdateContratDto } from '../dto/update-contrat.dto';
export declare class ContratController {
    private readonly contratService;
    constructor(contratService: ContratService);
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
    findAll(userId?: string, type?: ContratType, dateDebutFrom?: string, dateDebutTo?: string, includeArchived?: string): Promise<{
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
    getExpirationsProches(delai?: string): Promise<({
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
}
