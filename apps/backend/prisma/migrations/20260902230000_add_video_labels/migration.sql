-- CreateEnum
CREATE TYPE "LabelType" AS ENUM ('STEP', 'INFLUENCE', 'TAG');

-- CreateTable
CREATE TABLE "video_labels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LabelType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_labels_name_type_key" ON "video_labels"("name", "type");
