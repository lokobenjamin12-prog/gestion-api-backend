import { RoleService } from '../services/services.service';
import { CreateRoleDto } from '../dto/request/role-create.dto';
import { RoleFiltersDto } from '../dto/request/role-filters.dto';
import { UpdateRoleDto } from '../dto/request/role-update.dto';
import { SyncPermissionsDto } from '../dto/request/role-sync-permissions.dto';
import { AddRemovePermissionsDto } from '../dto/request/role-addRemovePermissions.dto';
import { RoleWithRelations } from '../dto/response/role-with-relations.dto';
import { PaginatedResponse } from '../../permission/dto/response/paginated-response';
import { Role } from '@prisma/client';
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    create(createRoleDto: CreateRoleDto, actorId: string): Promise<RoleWithRelations>;
    findAll(query: RoleFiltersDto): Promise<PaginatedResponse<RoleWithRelations>>;
    findOne(id: number): Promise<RoleWithRelations>;
    update(id: number, updateRoleDto: UpdateRoleDto, actorId: string): Promise<RoleWithRelations>;
    syncPermissions(id: number, syncPermissionsDto: SyncPermissionsDto, actorId: string): Promise<RoleWithRelations>;
    addPermissions(id: number, addPermissionsDto: AddRemovePermissionsDto, actorId: string): Promise<RoleWithRelations>;
    removePermissions(id: number, removePermissionsDto: AddRemovePermissionsDto, actorId: string): Promise<RoleWithRelations>;
    remove(id: number, actorId: string): Promise<Role>;
}
