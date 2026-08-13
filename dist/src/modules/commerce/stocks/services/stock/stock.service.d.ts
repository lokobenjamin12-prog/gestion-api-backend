import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMovementDto, GetHistoriqueDto, MovementResult, StockOverviewItemDto, StockAlertResponseDto, MovementHistoryResponseDto } from '../../dto/index';
import { CommerceLogService } from '../../../log/commerce-log.service';
import { StockRealtimeGateway } from '../../../realtime/stock-realtime.gateway';
export declare class StockService {
    private readonly prisma;
    private readonly commerceLog;
    private readonly stockGateway;
    private readonly logger;
    constructor(prisma: PrismaService, commerceLog: CommerceLogService, stockGateway: StockRealtimeGateway);
    processMovement(dto: CreateMovementDto, currentUser: any): Promise<MovementResult>;
    getStockOverview(): Promise<StockOverviewItemDto[]>;
    getArticlesEnAlerte(): Promise<StockAlertResponseDto[]>;
    getMouvementsStock(query: GetHistoriqueDto): Promise<MovementHistoryResponseDto>;
    private computeNewQuantity;
    private computeNiveauAlerte;
    private buildAlerte;
    private buildAlerteStock;
}
