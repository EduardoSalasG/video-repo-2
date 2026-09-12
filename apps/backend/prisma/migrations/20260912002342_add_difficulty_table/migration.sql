-- CreateTable
CREATE TABLE "difficulties" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "difficulties_pkey" PRIMARY KEY ("value")
);

-- Backfill any difficulty values already in use before adding the foreign key
INSERT INTO "difficulties" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
SELECT DISTINCT "difficulty"::text, "difficulty"::text, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "video_metadata"
ON CONFLICT ("value") DO NOTHING;

-- Ensure the four canonical values exist with their labels and logical order
INSERT INTO "difficulties" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES
    ('BEGINNER', 'Principiante', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('BASIC', 'Básico', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('INTERMEDIATE', 'Intermedio', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ADVANCED', 'Avanzado', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("value") DO NOTHING;

-- Normalize video_label_styles column definitions to match the Prisma schema
ALTER TABLE "video_label_styles" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable: convert enum column to text preserving existing values
ALTER TABLE "video_metadata" ALTER COLUMN "difficulty" SET DATA TYPE TEXT USING "difficulty"::text;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_difficulty_fkey" FOREIGN KEY ("difficulty") REFERENCES "difficulties"("value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "Difficulty";
