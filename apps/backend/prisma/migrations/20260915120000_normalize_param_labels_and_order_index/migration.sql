-- Fix the "BEGGINNER" typo if it exists in difficulties (value or label)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "difficulties" WHERE "value" = 'BEGGINNER') THEN
    IF EXISTS (SELECT 1 FROM "difficulties" WHERE "value" = 'BEGINNER') THEN
      UPDATE "video_metadata" SET "difficulty" = 'BEGINNER' WHERE "difficulty" = 'BEGGINNER';
      DELETE FROM "difficulties" WHERE "value" = 'BEGGINNER';
    ELSE
      UPDATE "difficulties" SET "value" = 'BEGINNER' WHERE "value" = 'BEGGINNER';
    END IF;
  END IF;
END $$;

-- Restore canonical labels for rows that were backfilled with label = value
UPDATE "difficulties" SET "label" = 'Principiante', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'BEGINNER' AND "label" = "value";
UPDATE "difficulties" SET "label" = 'Básico', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'BASIC' AND "label" = "value";
UPDATE "difficulties" SET "label" = 'Intermedio', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'INTERMEDIATE' AND "label" = "value";
UPDATE "difficulties" SET "label" = 'Avanzado', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'ADVANCED' AND "label" = "value";

UPDATE "primary_styles" SET "label" = 'Mambo', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'MAMBO_ON2' AND "label" = "value";
UPDATE "primary_styles" SET "label" = 'Casino', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'CASINO' AND "label" = "value";
UPDATE "primary_styles" SET "label" = 'Bachata Sensual', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'SENSUAL_BACHATA' AND "label" = "value";
UPDATE "primary_styles" SET "label" = 'Bachata Moderna', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'MODERN_BACHATA' AND "label" = "value";

UPDATE "video_types" SET "label" = 'Paso', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'STEP' AND "label" = "value";
UPDATE "video_types" SET "label" = 'Secuencia', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'SEQUENCE' AND "label" = "value";
UPDATE "video_types" SET "label" = 'Coreografía', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'CHOREOGRAPHY' AND "label" = "value";

UPDATE "label_types" SET "label" = 'Paso', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'STEP' AND "label" = "value";
UPDATE "label_types" SET "label" = 'Influencia', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'INFLUENCE' AND "label" = "value";
UPDATE "label_types" SET "label" = 'Tag', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'TAG' AND "label" = "value";

UPDATE "access_levels" SET "label" = 'Lectura', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'READ' AND "label" = "value";
UPDATE "access_levels" SET "label" = 'Escritura', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'WRITE' AND "label" = "value";
UPDATE "access_levels" SET "label" = 'Mantener', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'MAINTAIN' AND "label" = "value";

UPDATE "roles" SET "label" = 'Administrador', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'ADMIN' AND "label" = "value";
UPDATE "roles" SET "label" = 'Instructor', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'INSTRUCTOR' AND "label" = "value";
UPDATE "roles" SET "label" = 'Estudiante', "updatedAt" = CURRENT_TIMESTAMP WHERE "value" = 'STUDENT' AND "label" = "value";

-- Humanize any remaining raw labels (label identical to the internal value)
UPDATE "difficulties" SET "label" = INITCAP(REPLACE("value", '_', ' ')), "updatedAt" = CURRENT_TIMESTAMP WHERE "label" = "value";
UPDATE "primary_styles" SET "label" = INITCAP(REPLACE("value", '_', ' ')), "updatedAt" = CURRENT_TIMESTAMP WHERE "label" = "value";
UPDATE "video_types" SET "label" = INITCAP(REPLACE("value", '_', ' ')), "updatedAt" = CURRENT_TIMESTAMP WHERE "label" = "value";
UPDATE "label_types" SET "label" = INITCAP(REPLACE("value", '_', ' ')), "updatedAt" = CURRENT_TIMESTAMP WHERE "label" = "value";
UPDATE "access_levels" SET "label" = INITCAP(REPLACE("value", '_', ' ')), "updatedAt" = CURRENT_TIMESTAMP WHERE "label" = "value";
UPDATE "roles" SET "label" = INITCAP(REPLACE("value", '_', ' ')), "updatedAt" = CURRENT_TIMESTAMP WHERE "label" = "value";
UPDATE "permissions" SET "label" = INITCAP(REPLACE(REPLACE("value", '_', ' '), '.', ' ')), "updatedAt" = CURRENT_TIMESTAMP WHERE "label" = "value";

-- Normalize module orderIndex sequentially per course (stable order by previous index then creation)
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "courseId" ORDER BY "orderIndex" ASC, "createdAt" ASC) - 1 AS rn
  FROM "modules"
)
UPDATE "modules" m SET "orderIndex" = r.rn FROM ranked r WHERE m."id" = r."id";

-- Normalize section orderIndex sequentially per module
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "moduleId" ORDER BY "orderIndex" ASC, "createdAt" ASC) - 1 AS rn
  FROM "sections"
)
UPDATE "sections" s SET "orderIndex" = r.rn FROM ranked r WHERE s."id" = r."id";
