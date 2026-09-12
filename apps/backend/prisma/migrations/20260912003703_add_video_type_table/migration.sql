-- CreateTable
CREATE TABLE "video_types" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_types_pkey" PRIMARY KEY ("value")
);

-- Backfill any video type values already in use before adding the foreign key
INSERT INTO "video_types" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
SELECT DISTINCT "videoType"::text, "videoType"::text, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "video_metadata"
ON CONFLICT ("value") DO NOTHING;

-- Ensure the canonical values exist with their labels and order
INSERT INTO "video_types" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES
    ('STEP', 'Paso', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SEQUENCE', 'Secuencia', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CHOREOGRAPHY', 'Coreografía', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("value") DO NOTHING;

-- AlterTable: convert enum column to text preserving existing values
ALTER TABLE "video_metadata" ALTER COLUMN "videoType" SET DATA TYPE TEXT USING "videoType"::text;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_videoType_fkey" FOREIGN KEY ("videoType") REFERENCES "video_types"("value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "VideoType";
