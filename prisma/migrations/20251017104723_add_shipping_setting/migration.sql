-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "showInGallery" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "ShippingSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "processingDaysMin" INTEGER NOT NULL DEFAULT 1,
    "processingDaysMax" INTEGER NOT NULL DEFAULT 2,
    "transitDaysMin" INTEGER NOT NULL DEFAULT 2,
    "transitDaysMax" INTEGER NOT NULL DEFAULT 5,
    "weekendDelivery" BOOLEAN NOT NULL DEFAULT false,
    "regions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingSetting_pkey" PRIMARY KEY ("id")
);
