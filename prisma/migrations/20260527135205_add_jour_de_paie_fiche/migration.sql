/*
  Warnings:

  - Added the required column `jourDePaie` to the `fiches_de_paie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fiches_de_paie" ADD COLUMN     "jourDePaie" TIMESTAMP(3) NOT NULL;
