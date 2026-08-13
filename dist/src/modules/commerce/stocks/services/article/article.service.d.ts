import { PrismaService } from 'src/prisma/prisma.service';
import { GetArticlesQueryDto, CreateSimpleArticleDto, CreateArticleDto, UpdateArticleDto, CreateArticleResponseDto, GetArticlesResponseDto, ArticleDetailResponseDto, UpdateArticleResponseDto, CreateSimpleArticleResponseDto, DeleteArticleResponseDto, RestoreArticleResponseDto, HardDeleteResponseDto } from '../../dto/index';
import { GetCategoriesByArticleQueryDto } from '../../dto/request/get-categories-by-categoryId-query.dto';
import { CommerceLogService } from '../../../log/commerce-log.service';
import { StockRealtimeGateway } from '../../../realtime/stock-realtime.gateway';
export declare class ArticleService {
    private readonly prisma;
    private readonly commerceLog;
    private readonly realtimeGateway;
    private readonly logger;
    constructor(prisma: PrismaService, commerceLog: CommerceLogService, realtimeGateway: StockRealtimeGateway);
    createSimpleArticle(dto: CreateSimpleArticleDto, currentUser: any): Promise<CreateSimpleArticleResponseDto>;
    createArticleWithCategory(dto: CreateArticleDto, currentUser: any): Promise<CreateArticleResponseDto>;
    findAll(query: GetArticlesQueryDto, currentUser: any): Promise<GetArticlesResponseDto>;
    findOne(id: string, currentUser: any): Promise<ArticleDetailResponseDto>;
    getCategoriesByArticle(articleId: string, query: GetCategoriesByArticleQueryDto, currentUser: any): Promise<any>;
    update(id: string, dto: UpdateArticleDto, currentUser: any): Promise<UpdateArticleResponseDto>;
    softDeleteArticle(id: string, currentUser: any): Promise<DeleteArticleResponseDto>;
    restoreArticle(id: string, currentUser: any): Promise<RestoreArticleResponseDto>;
    hardDeleteArticle(id: string, currentUser: any): Promise<HardDeleteResponseDto>;
}
