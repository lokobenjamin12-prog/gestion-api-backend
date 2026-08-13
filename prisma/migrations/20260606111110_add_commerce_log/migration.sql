-- CreateEnum
CREATE TYPE "CommerceModule" AS ENUM ('STOCK', 'SALES_SESSION', 'ENTREPRISE');

-- CreateTable
CREATE TABLE "commerce_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "module" "CommerceModule" NOT NULL,
    "action" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "entityId" TEXT,
    "entityName" TEXT,
    "valeurAvant" TEXT,
    "valeurApres" TEXT,
    "state" "State" NOT NULL DEFAULT 'SUCCESS',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commerce_logs_actorId_idx" ON "commerce_logs"("actorId");

-- CreateIndex
CREATE INDEX "commerce_logs_module_idx" ON "commerce_logs"("module");

-- CreateIndex
CREATE INDEX "commerce_logs_action_idx" ON "commerce_logs"("action");

-- CreateIndex
CREATE INDEX "commerce_logs_entityId_idx" ON "commerce_logs"("entityId");

-- CreateIndex
CREATE INDEX "commerce_logs_createdAt_idx" ON "commerce_logs"("createdAt");

-- CreateIndex
CREATE INDEX "commerce_logs_level_idx" ON "commerce_logs"("level");

-- AddForeignKey
ALTER TABLE "commerce_logs" ADD CONSTRAINT "commerce_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
