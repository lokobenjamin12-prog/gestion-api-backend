/*
  Warnings:

  - You are about to drop the column `aPrevenu` on the `absences` table. All the data in the column will be lost.
  - You are about to drop the column `commentaire` on the `absences` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `absences` table. All the data in the column will be lost.
  - You are about to drop the column `deductionDecideeParAdmin` on the `absences` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `absences` table. All the data in the column will be lost.
  - You are about to drop the column `justificatifFourni` on the `absences` table. All the data in the column will be lost.
  - You are about to drop the column `raison` on the `absences` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `absences` table. All the data in the column will be lost.
  - You are about to drop the column `deductionAbsInjust` on the `salaires` table. All the data in the column will be lost.
  - You are about to drop the column `deductionAbsJust` on the `salaires` table. All the data in the column will be lost.
  - You are about to drop the column `nbAbsJustDeduit` on the `salaires` table. All the data in the column will be lost.
  - You are about to drop the column `nbRetards` on the `salaires` table. All the data in the column will be lost.
  - The `primes` column on the `salaires` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `grille_sanctions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[salaireId]` on the table `absences` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,mois,annee]` on the table `absences` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `annee` to the `absences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mois` to the `absences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nbJoursOuvrables` to the `salaires` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prixJournalier` to the `salaires` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "absences_date_idx";

-- DropIndex
DROP INDEX "absences_userId_date_idx";

-- DropIndex
DROP INDEX "absences_userId_date_type_key";

-- AlterTable
ALTER TABLE "absences" DROP COLUMN "aPrevenu",
DROP COLUMN "commentaire",
DROP COLUMN "date",
DROP COLUMN "deductionDecideeParAdmin",
DROP COLUMN "deletedAt",
DROP COLUMN "justificatifFourni",
DROP COLUMN "raison",
DROP COLUMN "type",
ADD COLUMN     "annee" INTEGER NOT NULL,
ADD COLUMN     "jours" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "mois" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "salaires" DROP COLUMN "deductionAbsInjust",
DROP COLUMN "deductionAbsJust",
DROP COLUMN "nbAbsJustDeduit",
DROP COLUMN "nbRetards",
ADD COLUMN     "deductionAbs" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "nbAbsJust" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nbJoursOuvrables" INTEGER NOT NULL,
ADD COLUMN     "nbRetardsInjust" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nbRetardsJust" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prixJournalier" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "totalPrimes" DECIMAL(12,2) NOT NULL DEFAULT 0,
ALTER COLUMN "totalDeductions" SET DEFAULT 0,
DROP COLUMN "primes",
ADD COLUMN     "primes" JSONB NOT NULL DEFAULT '[]';

-- DropTable
DROP TABLE "grille_sanctions";

-- CreateTable
CREATE TABLE "retards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mois" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "jours" JSONB NOT NULL DEFAULT '[]',
    "salaireId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "retards_salaireId_key" ON "retards"("salaireId");

-- CreateIndex
CREATE INDEX "retards_userId_idx" ON "retards"("userId");

-- CreateIndex
CREATE INDEX "retards_mois_annee_idx" ON "retards"("mois", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "retards_userId_mois_annee_key" ON "retards"("userId", "mois", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "absences_salaireId_key" ON "absences"("salaireId");

-- CreateIndex
CREATE INDEX "absences_mois_annee_idx" ON "absences"("mois", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "absences_userId_mois_annee_key" ON "absences"("userId", "mois", "annee");

-- AddForeignKey
ALTER TABLE "retards" ADD CONSTRAINT "retards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retards" ADD CONSTRAINT "retards_salaireId_fkey" FOREIGN KEY ("salaireId") REFERENCES "salaires"("id") ON DELETE SET NULL ON UPDATE CASCADE;
