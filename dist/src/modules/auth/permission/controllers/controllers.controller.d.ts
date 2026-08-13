import { PermissionService } from '../services/services.service';
import { CreatePermissionDto } from '../dto/request/permission-create.dto';
import { PermissionFiltersDto } from '../dto/request/permission-filters.dto';
import { UpdatePermissionDto } from '../dto/request/permission-update.dto';
import { Permission } from '@prisma/client';
import { PaginatedResponse } from '../dto/response/paginated-response';
import { PermissionWithCount } from '../dto/response/permission-with-count';
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    create(dto: CreatePermissionDto, actorId: string): Promise<Permission>;
    findAll(query: PermissionFiltersDto): Promise<PaginatedResponse<Permission>>;
    findOne(id: number): Promise<PermissionWithCount>;
    findBySlug(slug: string): Promise<PermissionWithCount>;
    update(id: number, dto: UpdatePermissionDto, actorId: string): Promise<PermissionWithCount>;
    remove(id: number, actorId: string): Promise<Permission>;
}
