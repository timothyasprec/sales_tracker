-- Migration: Add current_owner column to outreach table
-- This column tracks who is currently responsible for the lead (can be reassigned)
-- While ownership tracks who originally created the lead (immutable)

ALTER TABLE outreach
ADD COLUMN IF NOT EXISTS current_owner VARCHAR(255);

-- Set current_owner to ownership for existing records
UPDATE outreach
SET current_owner = ownership
WHERE current_owner IS NULL;

-- Add index for current_owner for faster filtering
CREATE INDEX IF NOT EXISTS idx_outreach_current_owner ON outreach(current_owner);

-- Add comment to explain the column
COMMENT ON COLUMN outreach.current_owner IS 'Current person responsible for following up on the lead (can be reassigned)';
COMMENT ON COLUMN outreach.ownership IS 'Original creator of the lead (immutable)';
