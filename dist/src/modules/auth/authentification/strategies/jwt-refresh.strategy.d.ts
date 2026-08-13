import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../../../prisma/prisma.service';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(req: Request, payload: any): Promise<{
        refreshToken: any;
        role: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nomRole: string;
            post: string;
            departmentId: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: number;
        email: string;
        accessToken: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        whatsappNumber: string | null;
        profilePicture: string | null;
        verified: boolean;
        active: boolean;
        status: import("@prisma/client").$Enums.AccountStatus;
        dateNaissance: Date | null;
        dateRecrutement: Date;
        adresse: string | null;
        salaireBase: import("@prisma/client-runtime-utils").Decimal;
        typeHoraire: import("@prisma/client").$Enums.HoraireEnum;
        estArchive: boolean;
        soldeConges: number;
        quotaCongesAnnuel: number;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
    }>;
}
export {};
