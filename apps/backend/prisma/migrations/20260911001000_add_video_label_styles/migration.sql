-- CreateTable
CREATE TABLE "video_label_styles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "labelId" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "video_label_styles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_label_styles_labelId_style_key" ON "video_label_styles"("labelId", "style");

-- AddForeignKey
ALTER TABLE "video_label_styles" ADD CONSTRAINT "video_label_styles_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "video_labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill STEP label styles from existing video_metadata
INSERT INTO "video_label_styles" ("labelId", "style")
SELECT vl.id, vm."primaryStyle"
FROM "video_metadata" vm
JOIN "video_labels" vl ON vl.name = ANY(vm.steps) AND vl.type = 'STEP'
ON CONFLICT ("labelId", "style") DO NOTHING;
