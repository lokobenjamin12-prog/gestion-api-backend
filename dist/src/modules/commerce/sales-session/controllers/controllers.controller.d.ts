import { CloseSessionDto, OpenSessionDto, SessionSummaryDto } from '../dto';
import { ServicesService } from '../services/services.service';
import { GetSessionsFilterDto } from '../dto/request/get-sessions-filter.dto';
import { PaginatedSessionsResponseDto } from '../dto/response/paginated-sessions-response-dto';
import { GetCommercialSessionsDto } from '../dto/request/get-commercial-sessions.dto';
export declare class ControllersController {
    private readonly salesSessionService;
    constructor(salesSessionService: ServicesService);
    openSession(dto: OpenSessionDto, userId: string): Promise<SessionSummaryDto>;
    closeSession(sessionId: string, dto: CloseSessionDto, userId: string): Promise<SessionSummaryDto>;
    cancelSession(sessionId: string, managerId: string): Promise<SessionSummaryDto>;
    findAll(filter: GetSessionsFilterDto): Promise<PaginatedSessionsResponseDto>;
    findOne(id: string): Promise<SessionSummaryDto>;
    findByCommercial(commercialId: string, query: GetCommercialSessionsDto): Promise<PaginatedSessionsResponseDto>;
}
