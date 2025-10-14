-- Add ownership column to builders table

ALTER TABLE builders ADD COLUMN IF NOT EXISTS ownership VARCHAR(255);

-- Create index for ownership filtering
CREATE INDEX IF NOT EXISTS idx_builders_ownership ON builders(ownership);

-- Add comment
COMMENT ON COLUMN builders.ownership IS 'Name of the staff member who created/owns this builder record';

