import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'Jean' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Dupont' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    lastName?: string;

    @ApiPropertyOptional({ example: '+237600000000' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    phoneNumber?: string;

    @ApiPropertyOptional({ example: '+237600000000' })
    @IsOptional()
    @IsString()
    whatsappNumber?: string;

    @ApiPropertyOptional({ example: 'Bonapriso, Douala' })
    @IsOptional()
    @IsString()
    adresse?: string;
}