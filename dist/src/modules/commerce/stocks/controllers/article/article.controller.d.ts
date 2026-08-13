import { ArticleService } from '../../services/article/article.service';
import { CreateArticleDto } from '../../dto/request/create-article.dto';
import { UpdateArticleDto } from '../../dto/request/update-article.dto';
import { GetArticlesQueryDto } from '../../dto/request/get-articles-query.dto';
import { CreateArticleResponseDto } from '../../dto/response/create-article-respons-dto';
import { ArticleDetailResponseDto } from '../../dto/response/article-detail-response.dto';
import { GetArticlesResponseDto } from '../../dto/response/get-articles-response.dto';
import { CreateSimpleArticleDto } from '../../dto/request/create-simple-article.dto';
import { GetCategoriesByArticleQueryDto } from '../../dto/request/get-categories-by-categoryId-query.dto';
export declare class ArticleController {
    private readonly articleService;
    constructor(articleService: ArticleService);
    createSimple(dto: CreateSimpleArticleDto, req: any): Promise<import("../../dto").CreateSimpleArticleResponseDto>;
    create(dto: CreateArticleDto, req: any): Promise<CreateArticleResponseDto>;
    findAll(query: GetArticlesQueryDto, req: any): Promise<GetArticlesResponseDto>;
    getCategoriesByArticle(id: string, query: GetCategoriesByArticleQueryDto, req: any): Promise<any>;
    findOne(id: string, req: any): Promise<ArticleDetailResponseDto>;
    update(id: string, dto: UpdateArticleDto, req: any): Promise<import("../../dto").UpdateArticleResponseDto>;
    softDeleteArticle(id: string, req: any): Promise<import("../../dto").DeleteArticleResponseDto>;
    restoreArticle(id: string, req: any): Promise<import("../../dto").RestoreArticleResponseDto>;
    remove(id: string, req: any): Promise<import("../../dto").HardDeleteResponseDto>;
}
