import { Prisma } from '@prisma/client';
declare const loginUserInclude: {
    role: {
        include: {
            permissions: {
                include: {
                    permission: true;
                };
            };
        };
    };
};
type LoginUser = Omit<Prisma.UserGetPayload<{
    include: typeof loginUserInclude;
}>, 'password' | 'emailToken' | 'emailTokenExpires'>;
export interface LoginResponse {
    message: string;
    user: LoginUser;
    accessToken: string;
    refreshToken: string;
}
export {};
