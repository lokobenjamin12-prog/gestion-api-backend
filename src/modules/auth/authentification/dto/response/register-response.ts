import { User } from "@prisma/client";

export interface RegisterResponse {
    message: string;
    user: Omit<User, 'password' | 'refreshTokenHash' | 'accessTokenHash'>;
}