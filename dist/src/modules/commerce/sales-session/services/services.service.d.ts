import { PrismaService } from 'src/prisma/prisma.service';
import { CloseSessionDto, OpenSessionDto, SessionSummaryDto } from '../dto/index';
import { GetSessionsFilterDto } from '../dto/request/get-sessions-filter.dto';
import { PaginatedSessionsResponseDto } from '../dto/response/paginated-sessions-response-dto';
import { GetCommercialSessionsDto } from '../dto/request/get-commercial-sessions.dto';
import { CommerceLogService } from '../../log/commerce-log.service';
import { StockRealtimeGateway } from '../../realtime/stock-realtime.gateway';
export declare class ServicesService {
    private readonly prisma;
    private readonly commerceLog;
    private readonly stockGateway;
    private readonly logger;
    constructor(prisma: PrismaService, commerceLog: CommerceLogService, stockGateway: StockRealtimeGateway);
    openSession(dto: OpenSessionDto, managerId: string): Promise<SessionSummaryDto>;
    closeSession(sessionId: string, dto: CloseSessionDto, managerId: string): Promise<SessionSummaryDto>;
    cancelSession(sessionId: string, managerId: string): Promise<SessionSummaryDto>;
    findAll(filter: GetSessionsFilterDto): Promise<PaginatedSessionsResponseDto>;
    findOne(id: string): Promise<SessionSummaryDto>;
    findByCommercial(commercialId: string, query: GetCommercialSessionsDto): Promise<PaginatedSessionsResponseDto>;
    private get sessionSelect();
    private computeNiveauAlerte;
    private formatSummary;
}
