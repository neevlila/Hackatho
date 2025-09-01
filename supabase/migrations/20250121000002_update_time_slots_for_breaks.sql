-- Update time_slots table to support breaks
ALTER TABLE time_slots 
ADD COLUMN IF NOT EXISTS is_break BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS break_name VARCHAR(255);

-- Add index for break filtering
CREATE INDEX IF NOT EXISTS idx_time_slots_is_break ON time_slots(is_break);

-- Update the existing time_slots to ensure all required fields are present
UPDATE time_slots 
SET is_break = FALSE 
WHERE is_break IS NULL;

-- Make sure the break_name can be null for regular classes
ALTER TABLE time_slots 
ALTER COLUMN break_name DROP NOT NULL;
