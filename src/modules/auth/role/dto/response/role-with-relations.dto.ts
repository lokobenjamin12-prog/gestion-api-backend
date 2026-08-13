import { Prisma } from "@prisma/client";

export type RoleWithRelations = Prisma.RoleGetPayload<{
    include: {
        department: true;
        permissions: { include: { permission: true } };
    };
}>;