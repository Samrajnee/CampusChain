/*
  Warnings:

  - Added the required column `description` to the `mentorships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mentorships" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT NOT NULL;
