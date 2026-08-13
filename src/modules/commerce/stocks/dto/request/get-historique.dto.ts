import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
//import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetHistoriqueDto {
    //@ApiPropertyOptional()
    @IsOptional()
    @IsString()
    articleStockId?: string;

    //@ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number) // Convertit la string de l'URL en number
    @IsInt()
    @Min(1)
    page?: number = 1;

    //@ApiPropertyOptional({ default: 50 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 50;
}