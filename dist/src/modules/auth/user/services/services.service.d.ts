import { Prisma } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from '../dto/request/user.dto';
import { UserFiltersDto } from '../dto/request/user-filters.dto';
import { PaginatedLogsDto } from '../dto/request/user-paginated-logs.dto';
import { MailService } from 'src/modules/auth/authentification/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthLogService } from '../../log/auth-log.service';
import { PaginatedUserResponseDto } from '../dto/response/user-response.dto';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';
export declare class UserService {
    private readonly prisma;
    private readonly authLog;
    private readonly mailService;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, authLog: AuthLogService, mailService: MailService, realtimeGateway: StockRealtimeGateway);
    private readonly logger;
    create(dto: CreateUserDto, actorId?: string, tx?: Prisma.TransactionClient): Promise<{
        role: {
            department: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
            permissions: ({
                permission: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    description: string;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                roleId: number;
                permissionId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nomRole: string;
            post: string;
            departmentId: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: number;
        email: string;
        refreshToken: string | null;
        accessToken: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        whatsappNumber: string | null;
        password: string;
        profilePicture: string | null;
        verified: boolean;
        active: boolean;
        status: import("@prisma/client").$Enums.AccountStatus;
        dateNaissance: Date | null;
        dateRecrutement: Date;
        adresse: string | null;
        salaireBase: Prisma.Decimal;
        typeHoraire: import("@prisma/client").$Enums.HoraireEnum;
        estArchive: boolean;
        soldeConges: number;
        quotaCongesAnnuel: number;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        emailToken: string | null;
        emailTokenExpires: Date | null;
    }>;
    createUserByAdmin(dto: CreateUserDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: number;
        email: string;
        refreshToken: string | null;
        accessToken: string | null;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        whatsappNumber: string | null;
        password: string;
        profilePicture: string | null;
        verified: boolean;
        active: boolean;
        status: import("@prisma/client").$Enums.AccountStatus;
        dateNaissance: Date | null;
        dateRecrutement: Date;
        adresse: string | null;
        salaireBase: Prisma.Decimal;
        typeHoraire: import("@prisma/client").$Enums.HoraireEnum;
        estArchive: boolean;
        soldeConges: number;
        quotaCongesAnnuel: number;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        emailToken: string | null;
        emailTokenExpires: Date | null;
    }>;
    findAll(filters: UserFiltersDto, actorId: string): Promise<PaginatedUserResponseDto>;
    findOne(id: string, actorId?: string): Promise<any>;
    findByEmail(email: string, isAuth?: boolean): Promise<any>;
    update(id: string, dto: UpdateUserDto, actorId: string): Promise<any>;
    archive(id: string, actorId: string): Promise<any>;
    restore(id: string, actorId: string): Promise<any>;
    getUserLogs(id: string, page?: number, limit?: number): Promise<PaginatedLogsDto>;
    updateProfilePicture(id: string, filePath: string, actorId: string): Promise<any>;
    private sanitizeUser;
    private defaultInclude;
}
