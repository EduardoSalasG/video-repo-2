-- AlterTable: superuser flag replaces hardcoded ADMIN bypasses
ALTER TABLE "roles" ADD COLUMN "isSuperuser" BOOLEAN NOT NULL DEFAULT false;
UPDATE "roles" SET "isSuperuser" = true WHERE "value" = 'ADMIN';

-- CreateTable: permission catalog (seeded, maps to @RequiresPermission checks)
CREATE TABLE "permissions" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("value")
);

-- CreateTable: role -> permission assignments
CREATE TABLE "role_permissions" (
    "roleValue" TEXT NOT NULL,
    "permissionValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleValue", "permissionValue")
);

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleValue_fkey" FOREIGN KEY ("roleValue") REFERENCES "roles"("value") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionValue_fkey" FOREIGN KEY ("permissionValue") REFERENCES "permissions"("value") ON DELETE CASCADE ON UPDATE CASCADE;
