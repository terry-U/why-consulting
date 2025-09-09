-- Expand report_type enum to include additional report kinds used by API
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'report_type' AND e.enumlabel = 'light_shadow'
  ) THEN
    ALTER TYPE report_type ADD VALUE 'light_shadow';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'report_type' AND e.enumlabel = 'philosophy'
  ) THEN
    ALTER TYPE report_type ADD VALUE 'philosophy';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'report_type' AND e.enumlabel = 'action_recipe'
  ) THEN
    ALTER TYPE report_type ADD VALUE 'action_recipe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'report_type' AND e.enumlabel = 'future_path'
  ) THEN
    ALTER TYPE report_type ADD VALUE 'future_path';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'report_type' AND e.enumlabel = 'epilogue'
  ) THEN
    ALTER TYPE report_type ADD VALUE 'epilogue';
  END IF;
END $$;


