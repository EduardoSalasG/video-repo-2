-- CreateTable
CREATE TABLE "primary_styles" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "primary_styles_pkey" PRIMARY KEY ("value")
);

-- Backfill any style values already in use before adding the foreign keys
INSERT INTO "primary_styles" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
SELECT DISTINCT val, val, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    SELECT "primaryStyle"::text AS val FROM "video_metadata"
    UNION
    SELECT "style" AS val FROM "video_label_styles"
) AS existing
ON CONFLICT ("value") DO NOTHING;

-- Ensure the four canonical values exist
INSERT INTO "primary_styles" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES
    ('MAMBO_ON2', 'Mambo', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CASINO', 'Casino', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SENSUAL_BACHATA', 'Bachata Sensual', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MODERN_BACHATA', 'Bachata Moderna', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("value") DO NOTHING;

-- AlterTable
ALTER TABLE "video_metadata" ALTER COLUMN "primaryStyle" SET DATA TYPE TEXT USING "primaryStyle"::text;

-- AlterTable
ALTER TABLE "video_label_styles" ALTER COLUMN "style" SET DATA TYPE TEXT USING "style"::text;

-- AddForeignKey
ALTER TABLE "video_metadata" ADD CONSTRAINT "video_metadata_primaryStyle_fkey" FOREIGN KEY ("primaryStyle") REFERENCES "primary_styles"("value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_label_styles" ADD CONSTRAINT "video_label_styles_style_fkey" FOREIGN KEY ("style") REFERENCES "primary_styles"("value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "PrimaryStyle";
