import { Prisma } from '@prisma/client';
export declare const getMeSelect: {
    id: true;
    email: true;
    firstName: true;
    lastName: true;
    phoneNumber: true;
    whatsappNumber: true;
    profilePicture: true;
    verified: true;
    role: {
        select: {
            id: true;
            nomRole: true;
            post: true;
            departmentId: true;
            createdAt: true;
            updatedAt: true;
            permissions: {
                select: {
                    permission: {
                        select: {
                            id: true;
                            slug: true;
                            description: true;
                        };
                    };
                };
            };
        };
    };
    active: true;
    status: true;
    createdAt: true;
    updatedAt: true;
};
export type GetMeResponse = Prisma.UserGetPayload<{
    select: typeof getMeSelect;
}>;
