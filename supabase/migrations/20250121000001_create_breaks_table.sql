-- Create breaks table for managing break/recess times
CREATE TABLE IF NOT EXISTS breaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days TEXT[] NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_breaks_user_id ON breaks(user_id);
CREATE INDEX IF NOT EXISTS idx_breaks_start_time ON breaks(start_time);

-- Add RLS policies
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own breaks
CREATE POLICY "Users can view own breaks" ON breaks
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own breaks
CREATE POLICY "Users can insert own breaks" ON breaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own breaks
CREATE POLICY "Users can update own breaks" ON breaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own breaks
CREATE POLICY "Users can delete own breaks" ON breaks
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_breaks_updated_at 
  BEFORE UPDATE ON breaks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
