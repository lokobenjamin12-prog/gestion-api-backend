import { StockService } from '../../services/stock/stock.service';
import { CreateMovementDto } from '../../dto/request/create-movement.dto';
import { GetHistoriqueDto } from '../../dto/request/get-historique.dto';
export declare class MovementStockController {
    private readonly stockService;
    constructor(stockService: StockService);
    private readonly logger;
    processMovement(dto: CreateMovementDto, req: any): Promise<import("../../dto").MovementResult>;
    getStockOverview(): Promise<import("../../dto").StockOverviewItemDto[]>;
    getAlerts(): Promise<import("../../dto").StockAlertResponseDto[]>;
    getMouvements(query: GetHistoriqueDto): Promise<import("../../dto").MovementHistoryResponseDto>;
}
