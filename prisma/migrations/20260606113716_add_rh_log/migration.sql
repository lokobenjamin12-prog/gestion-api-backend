-- CreateEnum
CREATE TYPE "RhModule" AS ENUM ('ABSENCE', 'RETARD', 'SALAIRE', 'FICHE_PAIE', 'CONTRAT', 'DEPARTMENT', 'RAPPORT');

-- CreateTable
CREATE TABLE "rh_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "module" "RhModule" NOT NULL,
    "action" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "entityId" TEXT,
    "entityName" TEXT,
    "valeurAvant" TEXT,
    "valeurApres" TEXT,
    "state" "State" NOT NULL DEFAULT 'SUCCESS',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rh_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rh_logs_actorId_idx" ON "rh_logs"("actorId");

-- CreateIndex
CREATE INDEX "rh_logs_module_idx" ON "rh_logs"("module");

-- CreateIndex
CREATE INDEX "rh_logs_action_idx" ON "rh_logs"("action");

-- CreateIndex
CREATE INDEX "rh_logs_entityId_idx" ON "rh_logs"("entityId");

-- CreateIndex
CREATE INDEX "rh_logs_createdAt_idx" ON "rh_logs"("createdAt");

-- CreateIndex
CREATE INDEX "rh_logs_level_idx" ON "rh_logs"("level");

-- AddForeignKey
ALTER TABLE "rh_logs" ADD CONSTRAINT "rh_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
