-- Create category_colors table to store user-specific category colors
-- This replaces the AsyncStorage-based approach for better consistency

CREATE TABLE IF NOT EXISTS category_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one color per category per user
  UNIQUE(user_id, category_name)
);

-- Create RLS (Row Level Security) policies
ALTER TABLE category_colors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own category colors
CREATE POLICY "Users can view their own category colors" ON category_colors
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own category colors
CREATE POLICY "Users can insert their own category colors" ON category_colors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own category colors
CREATE POLICY "Users can update their own category colors" ON category_colors
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own category colors
CREATE POLICY "Users can delete their own category colors" ON category_colors
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_category_colors_user_id ON category_colors(user_id);
CREATE INDEX IF NOT EXISTS idx_category_colors_user_category ON category_colors(user_id, category_name);

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_category_colors_updated_at BEFORE UPDATE ON category_colors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
