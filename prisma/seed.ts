import { PrismaClient, Role, AccountStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// 1. Charger le fichier .env
dotenv.config();

/**
 * 2. Initialisation du Driver Adapter pour Prisma 7 (PostgreSQL)
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL n'est pas définie dans le fichier .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Démarrage du seed (Structure Utilisateur & Droits)...');

  // --- 1. CRÉATION DU DÉPARTEMENT ---
  let department = await prisma.department.findUnique({
    where: { name: 'Direction Générale' },
  });

  if (!department) {
    department = await prisma.department.create({
      data: { name: 'Direction Générale' },
    });
  }
  console.log(`🏢 Département prêt : ${department.name}`);


  // --- 2. CRÉATION DE LA PERMISSION ---
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


  // --- 3. CRÉATION DU RÔLE (Lié au Département) ---
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


  // --- 4. ASSOCIATION RÔLE <-> PERMISSION (Table Pivot) ---
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



  // --- 5. CRÉATION DU SUPER ADMIN (Lié au Rôle) ---

  const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
  const adminEmail = String(process.env.ADMIN_EMAIL)
  const adminPassword = String(process.env.ADMIN_PASSWORD);
  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);
  const firstName = String(process.env.ADMIN_FIRST_NAME)
  const lastName = String(process.env.ADMIN_LAST_NAME)
  const phoneNumber = String(process.env.ADMIN_PHONE)
  const whatsappNumber = String(process.env.ADMIN_WHATSAPP)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      whatsappNumber: whatsappNumber,
      password: hashedPassword,
      verified: true,
      active: true,
      status: AccountStatus.ACTIVE,
      roleId: role.id,  // Assignation du rôle créé à l'étape 3
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

