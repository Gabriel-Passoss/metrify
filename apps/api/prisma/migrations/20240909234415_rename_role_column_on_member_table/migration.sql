/*
  Warnings:

  - You are about to drop the column `roles` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "roles",
ADD COLUMN     "role" "Role"[];
