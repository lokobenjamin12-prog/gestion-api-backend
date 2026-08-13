import { Role } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateRoleDto } from 'src/modules/auth/role/dto/request/role-create.dto';
import { UpdateRoleDto } from 'src/modules/auth/role/dto/request/role-update.dto';
import { SyncPermissionsDto } from 'src/modules/auth/role/dto/request/role-sync-permissions.dto';
import { AddRemovePermissionsDto } from 'src/modules/auth/role/dto/request/role-addRemovePermissions.dto';
import { RoleFiltersDto } from '../dto/request/role-filters.dto';
import { AuthLogService } from '../../log/auth-log.service';
import { RoleWithRelations } from '../dto/response/role-with-relations.dto';
import { PaginatedResponse } from '../../permission/dto/response/paginated-response';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';
export declare class RoleService {
    private readonly prisma;
    private readonly authLog;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, authLog: AuthLogService, realtimeGateway: StockRealtimeGateway);
    private readonly logger;
    private buildNomRole;
    create(dto: CreateRoleDto, actorId?: string): Promise<RoleWithRelations>;
    findAll(query: RoleFiltersDto): Promise<PaginatedResponse<RoleWithRelations>>;
    findOne(id: number): Promise<RoleWithRelations>;
    update(id: number, dto: UpdateRoleDto, actorId?: string): Promise<RoleWithRelations>;
    syncPermissions(id: number, dto: SyncPermissionsDto, actorId?: string): Promise<RoleWithRelations>;
    addPermissions(id: number, dto: AddRemovePermissionsDto, actorId?: string): Promise<RoleWithRelations>;
    removePermissions(id: number, dto: AddRemovePermissionsDto, actorId?: string): Promise<RoleWithRelations>;
    remove(id: number, actorId?: string): Promise<Role>;
    private defaultInclude;
}
