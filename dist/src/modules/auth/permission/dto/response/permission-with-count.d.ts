import { Prisma } from "@prisma/client";
export type PermissionWithCount = Prisma.PermissionGetPayload<{
    include: {
        _count: {
            select: {
                roles: true;
            };
        };
    };
}>;
