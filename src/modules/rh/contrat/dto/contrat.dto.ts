// src/contrat/dto/contrat.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsDateString,
    ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContratType } from '@prisma/client';


export class CreateContratDto {
    @ApiProperty({
        example: 'usr_employee123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur auquel est rattaché le contrat'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        enum: ContratType,
        example: ContratType.CDI,
        description: 'Nature juridique du contrat de travail'
    })
    @IsEnum(ContratType)
    type: ContratType;

    @ApiProperty({
        example: '2026-01-01',
        description: 'Date de prise d\'effet du contrat au format ISO (YYYY-MM-DD)'
    })
    @IsDateString()
    dateDebut: string;

    @ApiPropertyOptional({
        example: '2026-12-31',
        description: 'Date d\'échéance du contrat au format ISO (YYYY-MM-DD). Strictement obligatoire si le type est paramétré sur CDD.',
    })
    @ValidateIf((o) => o.type === ContratType.CDD)
    @IsDateString(
        {},
        { message: 'dateFin est obligatoire pour un CDD' }
    )
    dateFin?: string;
}

// ── DTO de mise à jour héritant des propriétés partielles ────────────────────
export class UpdateContratDto extends PartialType(CreateContratDto) { }