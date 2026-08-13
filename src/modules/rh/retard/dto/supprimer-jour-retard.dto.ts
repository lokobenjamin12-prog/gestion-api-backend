import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from "class-validator";

export class SupprimerJourRetardDto {
    @ApiProperty({
        example: 'cldxyz123',
        description: 'Identifiant unique (UUID ou CUID) du collaborateur concerné'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        example: '2026-07-07',
        description: 'La date précise de la journée de retard à supprimer au format ISO (YYYY-MM-DD)'
    })
    @IsDateString({}, { message: 'date doit être au format ISO : YYYY-MM-DD' })
    date: string;
}
