import { PaginationQueryDto } from "./pagination-query.dto";

// src/modules/sales-session/dto/get-commercial-sessions.dto.ts
export class GetCommercialSessionsDto extends PaginationQueryDto {
    // On pourrait ajouter ici : @IsOptional() @IsDate() dateDebut?: Date;
}