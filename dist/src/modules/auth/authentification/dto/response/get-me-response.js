"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeSelect = void 0;
exports.getMeSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    whatsappNumber: true,
    profilePicture: true,
    verified: true,
    role: {
        select: {
            id: true,
            nomRole: true,
            post: true,
            departmentId: true,
            createdAt: true,
            updatedAt: true,
            permissions: {
                select: {
                    permission: {
                        select: { id: true, slug: true, description: true },
                    },
                },
            },
        },
    },
    active: true,
    status: true,
    createdAt: true,
    updatedAt: true,
};
//# sourceMappingURL=get-me-response.js.map