import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentFiltersDto } from '../dto/department-filters.dto';
import { RhLogService } from '../../log/rh-log.service';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';
export declare class DepartmentService {
    private readonly prisma;
    private readonly rhLog;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, rhLog: RhLogService, realtimeGateway: StockRealtimeGateway);
    private readonly logger;
    create(dto: CreateDepartmentDto, actorId?: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: DepartmentFiltersDto): Promise<{
        data: ({
            roles: {
                id: number;
                _count: {
                    users: number;
                };
                nomRole: string;
                post: string;
            }[];
            _count: {
                roles: number;
            };
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
    findOne(id: number): Promise<{
        roles: ({
            _count: {
                users: number;
            };
            permissions: ({
                permission: {
                    id: number;
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
        })[];
        _count: {
            roles: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateDepartmentDto, actorId?: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number, actorId?: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
