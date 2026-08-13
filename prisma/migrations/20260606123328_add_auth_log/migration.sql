-- CreateEnum
CREATE TYPE "AuthModule" AS ENUM ('AUTH', 'USER', 'ROLE', 'PERMISSION');

-- CreateTable
CREATE TABLE "auth_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "module" "AuthModule" NOT NULL,
    "action" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "entityId" TEXT,
    "entityName" TEXT,
    "valeurAvant" TEXT,
    "valeurApres" TEXT,
    "state" "State" NOT NULL DEFAULT 'SUCCESS',
    "reason" "Reason",
    "message" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_logs_actorId_idx" ON "auth_logs"("actorId");

-- CreateIndex
CREATE INDEX "auth_logs_module_idx" ON "auth_logs"("module");

-- CreateIndex
CREATE INDEX "auth_logs_action_idx" ON "auth_logs"("action");

-- CreateIndex
CREATE INDEX "auth_logs_email_idx" ON "auth_logs"("email");

-- CreateIndex
CREATE INDEX "auth_logs_createdAt_idx" ON "auth_logs"("createdAt");

-- CreateIndex
CREATE INDEX "auth_logs_level_idx" ON "auth_logs"("level");

-- CreateIndex
CREATE INDEX "auth_logs_state_idx" ON "auth_logs"("state");

-- AddForeignKey
ALTER TABLE "auth_logs" ADD CONSTRAINT "auth_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
