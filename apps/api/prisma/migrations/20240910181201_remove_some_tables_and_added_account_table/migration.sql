/*
  Warnings:

  - The values [OWNER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `company_id` on the `invites` table. All the data in the column will be lost.
  - You are about to drop the column `member_id` on the `invites` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `member_id` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the `ads_costs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `card_operator_taxes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `companies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `installment_taxes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `other_taxes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stores` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email,organization_id]` on the table `invites` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,user_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `invites` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountProvider" AS ENUM ('GOOGLE');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'MANAGER', 'SELLER', 'BILLING');
ALTER TABLE "members" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "invites" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ads_costs" DROP CONSTRAINT "ads_costs_memberId_fkey";

-- DropForeignKey
ALTER TABLE "card_operator_taxes" DROP CONSTRAINT "card_operator_taxes_product_id_fkey";

-- DropForeignKey
ALTER TABLE "installment_taxes" DROP CONSTRAINT "installment_taxes_product_id_fkey";

-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_company_id_fkey";

-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_member_id_fkey";

-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_company_id_fkey";

-- DropForeignKey
ALTER TABLE "other_taxes" DROP CONSTRAINT "other_taxes_product_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_member_id_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_product_id_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_company_id_fkey";

-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_company_id_fkey";

-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_member_id_fkey";

-- DropIndex
DROP INDEX "invites_email_company_id_key";

-- DropIndex
DROP INDEX "members_email_key";

-- AlterTable
ALTER TABLE "invites" DROP COLUMN "company_id",
DROP COLUMN "member_id",
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "members" DROP COLUMN "avatar_url",
DROP COLUMN "company_id",
DROP COLUMN "created_at",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "password_hash",
DROP COLUMN "updated_at",
ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'SELLER',
ALTER COLUMN "role" SET DATA TYPE "Role";

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "company_id",
DROP COLUMN "member_id",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "ads_costs";

-- DropTable
DROP TABLE "card_operator_taxes";

-- DropTable
DROP TABLE "companies";

-- DropTable
DROP TABLE "installment_taxes";

-- DropTable
DROP TABLE "other_taxes";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "sales";

-- DropTable
DROP TABLE "stores";

-- DropEnum
DROP TYPE "AdsPlatform";

-- DropEnum
DROP TYPE "Installment";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "SaleStatus";

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "provider" "AccountProvider" NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_document_key" ON "organizations"("document");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_account_id_key" ON "accounts"("provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_user_id_key" ON "accounts"("provider", "user_id");

-- CreateIndex
CREATE INDEX "invites_email_idx" ON "invites"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invites_email_organization_id_key" ON "invites"("email", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_organization_id_user_id_key" ON "members"("organization_id", "user_id");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
