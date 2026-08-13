import { UserService } from '../services/services.service';
import { UpdateUserDto } from '../dto/request/user.dto';
import { UserFiltersDto } from '../dto/request/user-filters.dto';
import { AuthLogService } from '../../log/auth-log.service';
import { PaginatedUserResponseDto } from '../dto/response/user-response.dto';
export declare const PROFILE_PICTURE_DIR: string;
export declare class UserController {
    private readonly userService;
    private readonly authLog;
    constructor(userService: UserService, authLog: AuthLogService);
    findAll(filters: UserFiltersDto, req: any): Promise<PaginatedUserResponseDto>;
    findOne(id: string, req: any): Promise<any>;
    findByEmail(email: string, req: any): Promise<any>;
    update(id: string, dto: UpdateUserDto, req: any): Promise<any>;
    archive(id: string, req: any): Promise<any>;
    restore(id: string, req: any): Promise<any>;
    getUserLogs(id: string, page?: number, limit?: number): Promise<import("../dto/request/user-paginated-logs.dto").PaginatedLogsDto>;
    uploadProfilePicture(id: string, file: Express.Multer.File, req: any): Promise<any>;
}
