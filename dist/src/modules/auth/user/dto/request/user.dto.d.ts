import { HoraireEnum } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    whatsappNumber?: string;
    roleId: number;
    dateNaissance?: string;
    dateRecrutement?: string;
    adresse?: string;
    salaireBase?: number;
    typeHoraire?: HoraireEnum;
    quotaCongesAnnuel?: number;
}
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<Omit<CreateUserDto, "email" | "password">>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ArchiveUserDto {
    reason?: string;
}
export {};
