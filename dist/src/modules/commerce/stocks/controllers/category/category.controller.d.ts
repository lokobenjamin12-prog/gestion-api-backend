import { CreateCategoryDto } from '../../dto/request/create-category.dto';
import { CategoryService } from '../../services/category/category.service';
import { GetCategoriesQueryDto } from '../../dto/request/get-categories-query.dto';
import { UpdateCategoryDto } from '../../dto/request/update-category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(dto: CreateCategoryDto, req: any): Promise<import("../../dto").CreateCategoryResponseDto>;
    findAll(query: GetCategoriesQueryDto, req: any): Promise<import("../../dto").PaginatedCategoryResponseDto>;
    findOne(id: string, req: any): Promise<import("../../dto").CategoryDetailResponseDto>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, req: any): Promise<import("../../dto").UpdateCategoryResponseDto>;
    softRemove(id: string, req: any): Promise<import("../../dto").DeleteCategoryResponseDto>;
    restore(id: string, req: any): Promise<import("../../dto").RestoreCategoryResponseDto>;
    remove(id: string, req: any): Promise<import("../../dto").HardDeleteCategoryResponseDto>;
}
