-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "avatar_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "avatar_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "stores" ALTER COLUMN "avatar_url" DROP NOT NULL;
