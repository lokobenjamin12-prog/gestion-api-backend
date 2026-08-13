// dto/open-session.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export class OpenSessionDto {
    @ApiProperty({
        example: 'usr_comm456',
        description: 'Identifiant unique (UUID/CUID) du commercial associé à cette session de vente',
        required: true
    })
    @ApiProperty({ example: 'cldxyz123' })
    @IsString()
    @IsNotEmpty()
    commercialId: string;

    @ApiProperty({
        example: 'stk_art789',
        description: 'Identifiant unique du lot d\'articles ou du stock attribué pour la course/session',
        required: true
    })
    @ApiProperty({ example: 'cldabc456' })
    @IsString()
    @IsNotEmpty()
    articleStockId: string;

    @ApiProperty({
        example: 50,
        description: 'Quantité initiale de produits/marchandises emportée par le commercial au départ',
        minimum: 1,
        type: Number,
        required: true
    })
    @ApiProperty({ example: 10 })
    @IsInt()
    @IsPositive()
    quantiteDepart: number;

    @ApiPropertyOptional({
        example: '2026-07-06',
        description: 'Date d\'ouverture de la session (Format: YYYY-MM-DD) — prend la date du jour par défaut si non fournie',
    })
    @IsOptional()
    @IsDateString()
    jourOuverture?: string;

    @ApiPropertyOptional({
        example: '08:30',
        description: 'Heure de départ ou de début de session (Format HH:mm) — prend l\'heure actuelle de l\'instance par défaut si non fournie',
    })
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'heureDepart must be in HH:mm format (e.g. 08:30)',
    })
    heureDepart?: string;
}

