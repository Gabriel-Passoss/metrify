/*
  Warnings:

  - Made the column `user_id` on table `members` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "members" ALTER COLUMN "user_id" SET NOT NULL;
