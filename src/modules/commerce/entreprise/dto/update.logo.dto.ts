import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

// Utilisé en interne pour mettre à jour le chemin du logo
export class UpdateLogoDto {

    @ApiProperty({
        description: 'Le chemin d\'accès local ou l\'URL du fichier image du logo stocké sur le serveur.',
        example: 'uploads/logo/logo_entreprise_1719836800000.png',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    logo: string;
} 