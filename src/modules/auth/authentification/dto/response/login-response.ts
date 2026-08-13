import { Role, User } from "@prisma/client";


import { Prisma } from '@prisma/client';

// Une seule source de vérité pour la forme de "role" chargé au login
const loginUserInclude = {
    role: {
        include: {
            permissions: {
                include: { permission: true },
            },
        },
    },
} satisfies Prisma.UserInclude;

type LoginUser = Omit<
    Prisma.UserGetPayload<{ include: typeof loginUserInclude }>,
    'password' | 'emailToken' | 'emailTokenExpires'
>;

export interface LoginResponse {
    message: string;
    user: LoginUser;
    accessToken: string;
    refreshToken: string;
}




// export interface LoginResponse {
//     message: string;
//     user: Omit<User & { role: Role }, 'password' | 'emailToken' | 'emailTokenExpires'>;
//     accessToken: string;
//     refreshToken: string;
// }