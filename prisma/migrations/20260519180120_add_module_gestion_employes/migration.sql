-- CreateEnum
CREATE TYPE "AuditModule" AS ENUM ('USER', 'CONTRAT', 'ABSENCE', 'SALAIRE', 'GRILLE_SANCTIONS', 'FICHE_PAIE', 'RAPPORT', 'ROLE', 'PERMISSION', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "ContratType" AS ENUM ('CDD', 'CDI');

-- CreateEnum
CREATE TYPE "AbsenceType" AS ENUM ('RETARD', 'ABSENCE');

-- CreateEnum
CREATE TYPE "Raison" AS ENUM ('MALADIE', 'CONGE_PAYE', 'CONGE_SANS_SOLDE', 'INJUSTIFIE', 'AUTRE');

-- CreateEnum
CREATE TYPE "RapportType" AS ENUM ('ABSENCES', 'RETARDS', 'MASSE_SALARIALE', 'CONTRATS_CDD');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Reason" ADD VALUE 'VALIDATION_ERROR';
ALTER TYPE "Reason" ADD VALUE 'SERVER_ERROR';

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "module" "AuditModule" NOT NULL,
    "action" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "entityId" TEXT,
    "entityName" TEXT,
    "valeurAvant" TEXT,
    "valeurApres" TEXT,
    "state" "State" NOT NULL DEFAULT 'SUCCESS',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ContratType" NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertes_cdd" (
    "id" TEXT NOT NULL,
    "contratId" TEXT NOT NULL,
    "delaiJours" INTEGER NOT NULL,
    "estEnvoyee" BOOLEAN NOT NULL DEFAULT false,
    "envoyeeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertes_cdd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "AbsenceType" NOT NULL,
    "raison" "Raison",
    "aPrevenu" BOOLEAN NOT NULL DEFAULT false,
    "justificatifFourni" BOOLEAN NOT NULL DEFAULT false,
    "commentaire" TEXT,
    "deductionDecideeParAdmin" BOOLEAN,
    "salaireId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grille_sanctions" (
    "id" TEXT NOT NULL,
    "deductionRetard" DECIMAL(12,2) NOT NULL DEFAULT 2500,
    "deductionAbsInjust" DECIMAL(12,2) NOT NULL DEFAULT 15000,
    "deductionAbsJustifiee" DECIMAL(12,2) NOT NULL DEFAULT 10000,
    "seuilRetardRepete" INTEGER NOT NULL DEFAULT 3,
    "deductionRetardRepete" DECIMAL(12,2) NOT NULL DEFAULT 5000,
    "joursOuvresParMois" INTEGER NOT NULL DEFAULT 26,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grille_sanctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salaires" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mois" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "salaireBrut" DECIMAL(12,2) NOT NULL,
    "joursOuvres" INTEGER NOT NULL,
    "nbRetards" INTEGER NOT NULL DEFAULT 0,
    "deductionRetards" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "nbAbsInjust" INTEGER NOT NULL DEFAULT 0,
    "deductionAbsInjust" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "nbAbsJustDeduit" INTEGER NOT NULL DEFAULT 0,
    "deductionAbsJust" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(12,2) NOT NULL,
    "primes" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "salaireNet" DECIMAL(12,2) NOT NULL,
    "montantVerse" DECIMAL(12,2),
    "ecart" DECIMAL(12,2),
    "estCloture" BOOLEAN NOT NULL DEFAULT false,
    "dateCloture" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiches_de_paie" (
    "id" TEXT NOT NULL,
    "salaireId" TEXT NOT NULL,
    "fichierPDF" TEXT,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signeeParUser" BOOLEAN NOT NULL DEFAULT false,
    "dateSignature" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fiches_de_paie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapports" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "RapportType" NOT NULL,
    "periode" TEXT NOT NULL,
    "mois" INTEGER,
    "annee" INTEGER,
    "formatExport" "ExportFormat" NOT NULL,
    "fichier" TEXT,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rapports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "journal_audit_actorId_idx" ON "journal_audit"("actorId");

-- CreateIndex
CREATE INDEX "journal_audit_module_idx" ON "journal_audit"("module");

-- CreateIndex
CREATE INDEX "journal_audit_action_idx" ON "journal_audit"("action");

-- CreateIndex
CREATE INDEX "journal_audit_entityId_idx" ON "journal_audit"("entityId");

-- CreateIndex
CREATE INDEX "journal_audit_createdAt_idx" ON "journal_audit"("createdAt");

-- CreateIndex
CREATE INDEX "journal_audit_level_idx" ON "journal_audit"("level");

-- CreateIndex
CREATE INDEX "contrats_userId_idx" ON "contrats"("userId");

-- CreateIndex
CREATE INDEX "contrats_type_dateFin_idx" ON "contrats"("type", "dateFin");

-- CreateIndex
CREATE UNIQUE INDEX "alertes_cdd_contratId_delaiJours_key" ON "alertes_cdd"("contratId", "delaiJours");

-- CreateIndex
CREATE INDEX "absences_userId_idx" ON "absences"("userId");

-- CreateIndex
CREATE INDEX "absences_date_idx" ON "absences"("date");

-- CreateIndex
CREATE INDEX "absences_userId_date_idx" ON "absences"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "absences_userId_date_type_key" ON "absences"("userId", "date", "type");

-- CreateIndex
CREATE INDEX "salaires_userId_idx" ON "salaires"("userId");

-- CreateIndex
CREATE INDEX "salaires_mois_annee_idx" ON "salaires"("mois", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "salaires_userId_mois_annee_key" ON "salaires"("userId", "mois", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "fiches_de_paie_salaireId_key" ON "fiches_de_paie"("salaireId");

-- CreateIndex
CREATE INDEX "rapports_type_idx" ON "rapports"("type");

-- CreateIndex
CREATE INDEX "rapports_userId_idx" ON "rapports"("userId");

-- AddForeignKey
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes_cdd" ADD CONSTRAINT "alertes_cdd_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_salaireId_fkey" FOREIGN KEY ("salaireId") REFERENCES "salaires"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salaires" ADD CONSTRAINT "salaires_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_de_paie" ADD CONSTRAINT "fiches_de_paie_salaireId_fkey" FOREIGN KEY ("salaireId") REFERENCES "salaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapports" ADD CONSTRAINT "rapports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
