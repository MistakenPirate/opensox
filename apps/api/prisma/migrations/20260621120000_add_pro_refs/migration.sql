-- CreateEnum
CREATE TYPE "RefCategory" AS ENUM ('software', 'ai', 'health', 'ui', 'open_source', 'content');

-- CreateTable
CREATE TABLE "ProRef" (
    "id" TEXT NOT NULL,
    "category" "RefCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProRef_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProRef_category_idx" ON "ProRef"("category");

-- CreateIndex
CREATE INDEX "ProRef_order_idx" ON "ProRef"("order");
