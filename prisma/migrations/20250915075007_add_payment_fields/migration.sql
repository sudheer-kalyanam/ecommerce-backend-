-- AlterTable
ALTER TABLE "orders" ADD COLUMN "estimatedDelivery" DATETIME;
ALTER TABLE "orders" ADD COLUMN "paymentDetails" JSONB;
ALTER TABLE "orders" ADD COLUMN "paymentId" TEXT;
ALTER TABLE "orders" ADD COLUMN "paymentStatus" TEXT;
