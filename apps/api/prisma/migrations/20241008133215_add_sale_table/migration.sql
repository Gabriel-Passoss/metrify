-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'PIX', 'BANKSLIP');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('PAID', 'PENDING', 'CANCELED');

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "platfrom" TEXT NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "sale_code" TEXT NOT NULL,
    "status" "SaleStatus" NOT NULL,
    "customer_name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" TEXT,
    "seller_id" TEXT NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
