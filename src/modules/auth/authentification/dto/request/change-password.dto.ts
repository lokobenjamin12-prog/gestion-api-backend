import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordProfileDto {
    @ApiProperty({ example: 'MonAncienMotDePasse123' })
    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @ApiProperty({ example: 'MonNouveauMotDePasse456' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' })
    newPassword: string;
}