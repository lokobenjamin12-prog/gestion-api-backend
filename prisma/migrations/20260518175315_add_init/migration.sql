-- CreateEnum
CREATE TYPE "HoraireEnum" AS ENUM ('JOUR', 'NUIT', 'MIXTE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "Reason" AS ENUM ('UNAUTHORIZED', 'FORBIDDEN', 'BAD_REQUEST', 'CONFLICT', 'UNKNOWN', 'NOT_FOUND', 'INTERNAL_SERVER_ERROR');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'DEACTIVATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TypeSeuil" AS ENUM ('NORMAL', 'ALERTE', 'CRITIQUE');

-- CreateEnum
CREATE TYPE "TypeMouvement" AS ENUM ('ENTREE', 'SORTIE', 'AJUSTEMENT', 'PERTE', 'INITIALISATION');

-- CreateTable
CREATE TABLE "Depense" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "motif" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salesSessionId" TEXT NOT NULL,

    CONSTRAINT "Depense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nomRole" TEXT NOT NULL,
    "post" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "password" TEXT NOT NULL,
    "profilePicture" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "dateNaissance" TIMESTAMP(3),
    "dateRecrutement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adresse" TEXT,
    "salaireBase" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "typeHoraire" "HoraireEnum" NOT NULL DEFAULT 'JOUR',
    "estArchive" BOOLEAN NOT NULL DEFAULT false,
    "soldeConges" INTEGER NOT NULL DEFAULT 0,
    "quotaCongesAnnuel" INTEGER NOT NULL DEFAULT 30,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "emailToken" TEXT,
    "emailTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_logs" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "module" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "state" "State" NOT NULL DEFAULT 'SUCCESS',
    "reason" "Reason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesSession" (
    "id" TEXT NOT NULL,
    "commercialId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "articleStockId" TEXT NOT NULL,
    "quantiteDepart" INTEGER NOT NULL,
    "quantiteRetour" INTEGER,
    "heureDepart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heureRetour" TIMESTAMP(3),
    "totalVentesRecues" INTEGER,
    "depensesImprevues" INTEGER NOT NULL DEFAULT 0,
    "motifDepense" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'OPEN',
    "mouvementDepartId" TEXT,
    "mouvementRetourId" TEXT,
    "totalDepenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nomUnique" TEXT NOT NULL,
    "prixUnite" INTEGER NOT NULL,
    "description" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleStock" (
    "id" TEXT NOT NULL,
    "quantiteActuelle" INTEGER NOT NULL DEFAULT 0,
    "niveauAlerte" "TypeSeuil" NOT NULL DEFAULT 'NORMAL',
    "deletedAt" TIMESTAMP(3),
    "articleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 20,
    "seuilCritique" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementStock" (
    "id" TEXT NOT NULL,
    "type" "TypeMouvement" NOT NULL,
    "quantiteSortieOuEntree" INTEGER NOT NULL,
    "motif" TEXT,
    "quantiteAvant" INTEGER NOT NULL,
    "quantiteApres" INTEGER NOT NULL,
    "movementDate" TIMESTAMP(3) NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "articleStockId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovementStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_slug_key" ON "permissions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nomRole_key" ON "roles"("nomRole");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_refreshToken_key" ON "users"("refreshToken");

-- CreateIndex
CREATE INDEX "user_logs_userId_idx" ON "user_logs"("userId");

-- CreateIndex
CREATE INDEX "user_logs_date_idx" ON "user_logs"("date");

-- CreateIndex
CREATE INDEX "user_logs_state_idx" ON "user_logs"("state");

-- CreateIndex
CREATE INDEX "user_logs_reason_idx" ON "user_logs"("reason");

-- CreateIndex
CREATE INDEX "user_logs_module_idx" ON "user_logs"("module");

-- CreateIndex
CREATE INDEX "user_logs_action_idx" ON "user_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "SalesSession_mouvementDepartId_key" ON "SalesSession"("mouvementDepartId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesSession_mouvementRetourId_key" ON "SalesSession"("mouvementRetourId");

-- CreateIndex
CREATE INDEX "SalesSession_commercialId_idx" ON "SalesSession"("commercialId");

-- CreateIndex
CREATE INDEX "SalesSession_managerId_idx" ON "SalesSession"("managerId");

-- CreateIndex
CREATE INDEX "SalesSession_articleStockId_idx" ON "SalesSession"("articleStockId");

-- CreateIndex
CREATE INDEX "SalesSession_status_idx" ON "SalesSession"("status");

-- CreateIndex
CREATE INDEX "Category_articleId_idx" ON "Category"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_nom_key" ON "Article"("nom");

-- CreateIndex
CREATE INDEX "ArticleStock_articleId_idx" ON "ArticleStock"("articleId");

-- CreateIndex
CREATE INDEX "ArticleStock_categoryId_idx" ON "ArticleStock"("categoryId");

-- CreateIndex
CREATE INDEX "ArticleStock_niveauAlerte_idx" ON "ArticleStock"("niveauAlerte");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleStock_articleId_categoryId_key" ON "ArticleStock"("articleId", "categoryId");

-- CreateIndex
CREATE INDEX "MovementStock_articleStockId_idx" ON "MovementStock"("articleStockId");

-- CreateIndex
CREATE INDEX "MovementStock_articleId_idx" ON "MovementStock"("articleId");

-- CreateIndex
CREATE INDEX "MovementStock_userId_idx" ON "MovementStock"("userId");

-- CreateIndex
CREATE INDEX "MovementStock_movementDate_idx" ON "MovementStock"("movementDate");

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_salesSessionId_fkey" FOREIGN KEY ("salesSessionId") REFERENCES "SalesSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_logs" ADD CONSTRAINT "user_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSession" ADD CONSTRAINT "SalesSession_commercialId_fkey" FOREIGN KEY ("commercialId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSession" ADD CONSTRAINT "SalesSession_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSession" ADD CONSTRAINT "SalesSession_articleStockId_fkey" FOREIGN KEY ("articleStockId") REFERENCES "ArticleStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSession" ADD CONSTRAINT "SalesSession_mouvementDepartId_fkey" FOREIGN KEY ("mouvementDepartId") REFERENCES "MovementStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSession" ADD CONSTRAINT "SalesSession_mouvementRetourId_fkey" FOREIGN KEY ("mouvementRetourId") REFERENCES "MovementStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleStock" ADD CONSTRAINT "ArticleStock_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleStock" ADD CONSTRAINT "ArticleStock_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementStock" ADD CONSTRAINT "MovementStock_articleStockId_fkey" FOREIGN KEY ("articleStockId") REFERENCES "ArticleStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementStock" ADD CONSTRAINT "MovementStock_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementStock" ADD CONSTRAINT "MovementStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
