"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("❌ DATABASE_URL n'est pas définie dans le fichier .env");
}
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🚀 Démarrage du seed (Structure Utilisateur & Droits)...');
    let department = await prisma.department.findUnique({
        where: { name: 'Direction Générale' },
    });
    if (!department) {
        department = await prisma.department.create({
            data: { name: 'Direction Générale' },
        });
    }
    console.log(`🏢 Département prêt : ${department.name}`);
    let permission = await prisma.permission.findUnique({
        where: { slug: 'Manage_system' },
    });
    if (!permission) {
        permission = await prisma.permission.create({
            data: {
                slug: 'Manage_system',
                description: 'Accès total au système',
            },
        });
    }
    console.log(`🔑 Permission prête : ${permission.slug}`);
    const nomRole = `Manager_${department.name}`;
    let role = await prisma.role.findUnique({
        where: { nomRole },
    });
    if (!role) {
        role = await prisma.role.create({
            data: {
                nomRole: nomRole,
                post: 'Manager',
                departmentId: department.id,
            },
        });
    }
    console.log(`🛡️ Rôle prêt : ${role.nomRole}`);
    const rolePermission = await prisma.rolePermission.findUnique({
        where: {
            roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
    });
    if (!rolePermission) {
        await prisma.rolePermission.create({
            data: {
                roleId: role.id,
                permissionId: permission.id,
            },
        });
    }
    console.log(`🔗 Relation Rôle-Permission synchronisée`);
    const SALT_ROUNDS = 12;
    const adminEmail = 'lokobenjamin12@gmail.com';
    const adminPassword = 'AdminPassword12345@';
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            firstName: 'Super',
            lastName: 'Admin',
            phoneNumber: '+23754347186',
            whatsappNumber: '+23754347186',
            password: hashedPassword,
            verified: true,
            active: true,
            status: client_1.AccountStatus.ACTIVE,
            roleId: role.id,
        },
    });
    console.log('------------------------------------------');
    console.log(`✅ Super Admin prêt : ${admin.email}`);
    console.log('------------------------------------------');
}
main()
    .catch((e) => {
    console.error('❌ Erreur lors du seeding :');
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('🔌 Connexions fermées.');
});
//# sourceMappingURL=seed.js.map