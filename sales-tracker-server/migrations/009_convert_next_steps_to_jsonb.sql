-- Migration: Convert next_steps from TEXT to JSONB array
-- This allows tracking multiple pending next steps with timestamps

-- Step 1: Add a temporary column for the new JSONB structure
ALTER TABLE outreach ADD COLUMN next_steps_new JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data
-- Convert existing text next_steps to JSONB array format
-- Format: [{ "task": "text", "created_at": "timestamp", "completed": false }]
UPDATE outreach
SET next_steps_new =
  CASE
    WHEN next_steps IS NOT NULL AND next_steps != '' THEN
      jsonb_build_array(
        jsonb_build_object(
          'id', gen_random_uuid()::text,
          'task', next_steps,
          'created_at', COALESCE(updated_at, created_at),
          'completed', false
        )
      )
    ELSE '[]'::jsonb
  END;

-- Step 3: Drop the old column
ALTER TABLE outreach DROP COLUMN next_steps;

-- Step 4: Rename the new column
ALTER TABLE outreach RENAME COLUMN next_steps_new TO next_steps;

-- Step 5: Drop the old index and create a new GIN index for JSONB
DROP INDEX IF EXISTS idx_outreach_next_steps;
CREATE INDEX idx_outreach_next_steps ON outreach USING gin(next_steps);

-- Step 6: Add a comment
COMMENT ON COLUMN outreach.next_steps IS 'Array of next step objects with id, task, created_at, and completed fields';
