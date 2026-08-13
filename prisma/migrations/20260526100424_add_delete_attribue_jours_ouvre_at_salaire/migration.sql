/*
  Warnings:

  - You are about to drop the column `joursOuvres` on the `salaires` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rapports" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "estArchive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "salaires" DROP COLUMN "joursOuvres";
