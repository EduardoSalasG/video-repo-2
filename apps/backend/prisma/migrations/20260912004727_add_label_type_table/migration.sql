-- CreateTable
CREATE TABLE "label_types" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_types_pkey" PRIMARY KEY ("value")
);

-- Backfill any label type values already in use before adding the foreign key
INSERT INTO "label_types" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
SELECT DISTINCT "type"::text, "type"::text, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "video_labels"
ON CONFLICT ("value") DO NOTHING;

-- Ensure the canonical values exist with their labels and order
INSERT INTO "label_types" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES
    ('STEP', 'Paso', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('INFLUENCE', 'Influencia', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TAG', 'Tag', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("value") DO NOTHING;

-- AlterTable: convert enum column to text preserving existing values
ALTER TABLE "video_labels" ALTER COLUMN "type" SET DATA TYPE TEXT USING "type"::text;

-- AddForeignKey
ALTER TABLE "video_labels" ADD CONSTRAINT "video_labels_type_fkey" FOREIGN KEY ("type") REFERENCES "label_types"("value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "LabelType";
