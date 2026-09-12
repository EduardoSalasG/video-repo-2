-- CreateTable
CREATE TABLE "roles" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("value")
);

-- Backfill canonical values
INSERT INTO "roles" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES
    ('ADMIN', 'Admin', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('INSTRUCTOR', 'Instructor', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('STUDENT', 'Estudiante', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("value") DO NOTHING;

-- Backfill any other values already in use
INSERT INTO "roles" ("value", "label", "orderIndex", "isActive", "createdAt", "updatedAt")
SELECT DISTINCT u."role"::text, u."role"::text, 100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users" u
WHERE NOT EXISTS (
    SELECT 1 FROM "roles" r WHERE r."value" = u."role"::text
);

-- AlterTable: preserve data by casting instead of dropping the column
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE TEXT USING "role"::text;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_fkey" FOREIGN KEY ("role") REFERENCES "roles"("value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "Role";
