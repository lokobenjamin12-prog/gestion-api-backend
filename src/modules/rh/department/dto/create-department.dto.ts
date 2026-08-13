// src/department/dto/create-department.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
    @ApiProperty({
        example: 'FINANCE',
        description: 'Le nom unique du département. Il sera automatiquement débarrassé des espaces superflus (trim) et converti en lettres majuscules côté serveur.',
        minLength: 2
    })
    @ApiProperty({ example: 'Finance' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name: string;
}

