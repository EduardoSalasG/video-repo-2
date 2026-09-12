-- CreateTable
CREATE TABLE "access_levels" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_levels_pkey" PRIMARY KEY ("value")
);

-- Backfill any access level values already in use before adding the foreign key
INSERT INTO "access_levels" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
SELECT DISTINCT "accessLevel"::text, "accessLevel"::text, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "course_access"
ON CONFLICT ("value") DO NOTHING;

-- Ensure the canonical values exist with their labels and hierarchy order
INSERT INTO "access_levels" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES
    ('READ', 'Lectura', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('WRITE', 'Escritura', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MAINTAIN', 'Mantener', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("value") DO NOTHING;

-- AlterTable: convert enum column to text preserving existing values
ALTER TABLE "course_access" ALTER COLUMN "accessLevel" SET DATA TYPE TEXT USING "accessLevel"::text;

-- AddForeignKey
ALTER TABLE "course_access" ADD CONSTRAINT "course_access_accessLevel_fkey" FOREIGN KEY ("accessLevel") REFERENCES "access_levels"("value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "AccessLevel";
