import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma/prisma.service';
export interface JwtPayload {
    sub: string;
    email: string;
    nomrole: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        role: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nomRole: string;
            post: string;
            departmentId: number;
        };
        email: string;
        firstName: string;
        lastName: string;
        verified: boolean;
        active: boolean;
        status: import("@prisma/client").$Enums.AccountStatus;
    }>;
}
export {};
