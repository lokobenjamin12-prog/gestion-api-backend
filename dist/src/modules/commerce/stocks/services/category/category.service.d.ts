import { CreateCategoryDto } from '../../dto/request/create-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetCategoriesQueryDto } from '../../dto/request/get-categories-query.dto';
import { HardDeleteCategoryResponseDto, RestoreCategoryResponseDto, DeleteCategoryResponseDto, UpdateCategoryResponseDto, CreateCategoryResponseDto, PaginatedCategoryResponseDto, CategoryDetailResponseDto, UpdateCategoryDto } from '../../dto/index';
import { CommerceLogService } from '../../../log/commerce-log.service';
import { StockRealtimeGateway } from '../../../realtime/stock-realtime.gateway';
export declare class CategoryService {
    private readonly prisma;
    private readonly commerceLog;
    private readonly realtimeGateway;
    private readonly logger;
    constructor(prisma: PrismaService, commerceLog: CommerceLogService, realtimeGateway: StockRealtimeGateway);
    create(dto: CreateCategoryDto, currentUser: any): Promise<CreateCategoryResponseDto>;
    findAll(query: GetCategoriesQueryDto, currentUser: any): Promise<PaginatedCategoryResponseDto>;
    findOne(id: string, currentUser: any): Promise<CategoryDetailResponseDto>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, currentUser: any): Promise<UpdateCategoryResponseDto>;
    softDelete(id: string, currentUser: any): Promise<DeleteCategoryResponseDto>;
    restore(id: string, currentUser: any): Promise<RestoreCategoryResponseDto>;
    remove(id: string, currentUser: any): Promise<HardDeleteCategoryResponseDto>;
}
