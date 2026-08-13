import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DepenseItemDto {
    @ApiProperty({
        description: 'Montant de la dépense effectuée en FCFA',
        example: 2500,
        minimum: 0,
        type: Number
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    montant: number;

    @ApiProperty({
        description: 'Motif ou justification de la dépense (ex: carburant, ration, imprévu)',
        example: 'Achat de carburant pour livraison brousse',
    })
    @IsNotEmpty()
    @IsString()
    motif: string;
}

export class CloseSessionDto {
    @ApiProperty({
        description: 'Quantité totale d\'articles ou produits retournés invendus en fin de session',
        example: 5,
        minimum: 0,
        type: Number
    })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    quantiteRetour: number;

    @ApiPropertyOptional({
        type: [DepenseItemDto], // Indique explicitement à Swagger qu'il s'agit d'un tableau d'objets DepenseItemDto
        description: 'Liste optionnelle des petites dépenses déclarées par le commercial durant sa session de vente',
        default: [],
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => DepenseItemDto)
    depenses: DepenseItemDto[] = [];

    @ApiPropertyOptional({
        example: '17:30',
        description: 'Heure de retour ou de fin de course effective (Format HH:mm) — prend l\'heure actuelle par défaut si non fournie',
    })
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'heureRetour must be in HH:mm format (e.g. 08:30)',
    })
    heureRetour?: string;
}