import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
    @ApiProperty({
        example: 'employe:create',
        description: 'Slug technique unique de la permission. Format strict requis : ressource:action (lettres minuscules et underscores autorisés).',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z_]+:[a-z_]+$/, {
        message: 'Le slug doit suivre le format ressource:action (ex: department:create)',
    })
    slug: string;

    @ApiProperty({
        example: 'Permet de créer un nouvel employé dans le système',
        description: 'Description claire et fonctionnelle de ce que permet ce droit',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    description: string;
}