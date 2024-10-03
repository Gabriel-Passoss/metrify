-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_organization_id_fkey";

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cost_per_unit" INTEGER,
    "shipping_cost" INTEGER,
    "tax_cost" INTEGER,
    "pix_tax" INTEGER,
    "bank_slip_tax" INTEGER,
    "store_id" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card_installment_prices" (
    "id" TEXT NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "credit_card_installment_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card_taxes" (
    "id" TEXT NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "credit_card_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extra_taxes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tax" INTEGER NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "extra_taxes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_installment_prices" ADD CONSTRAINT "credit_card_installment_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_taxes" ADD CONSTRAINT "credit_card_taxes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extra_taxes" ADD CONSTRAINT "extra_taxes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
