import { PrismaService } from '../../../../prisma/prisma.service';
import { CreatePermissionDto } from '../dto/request/permission-create.dto';
import { UpdatePermissionDto } from '../dto/request/permission-update.dto';
import { PermissionFiltersDto } from '../dto/request/permission-filters.dto';
import { Permission } from '@prisma/client';
import { AuthLogService } from '../../log/auth-log.service';
import { PaginatedResponse } from '../dto/response/paginated-response';
import { PermissionWithCount } from '../dto/response/permission-with-count';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';
export declare class PermissionService {
    private readonly prisma;
    private readonly authLog;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, authLog: AuthLogService, realtimeGateway: StockRealtimeGateway);
    private readonly logger;
    create(dto: CreatePermissionDto, actorId?: string): Promise<Permission>;
    findAll(query: PermissionFiltersDto): Promise<PaginatedResponse<Permission>>;
    findOne(id: number): Promise<PermissionWithCount>;
    findBySlug(slug: string): Promise<PermissionWithCount>;
    update(id: number, dto: UpdatePermissionDto, actorId?: string): Promise<PermissionWithCount>;
    remove(id: number, actorId?: string): Promise<Permission>;
    seedDefaultPermissions(): Promise<void>;
}
