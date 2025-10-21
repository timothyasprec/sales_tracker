-- Migration: Add stage_detail column to outreach table
-- This column stores additional details for specific stages:
-- - Active Lead: "Connected to PBC" or "Someone responded positively (Setting up a meeting, had multiple meetings)"
-- - Close Won: "Gets Job Offer"
-- - Close Loss: "Nothing Worked"

ALTER TABLE outreach
ADD COLUMN IF NOT EXISTS stage_detail VARCHAR(255);

-- Add index for stage_detail for faster filtering
CREATE INDEX IF NOT EXISTS idx_outreach_stage_detail ON outreach(stage_detail);

-- Add comment to explain the column
COMMENT ON COLUMN outreach.stage_detail IS 'Additional detail for stages: Active Lead (type), Close Won (reason), Close Loss (reason)';
