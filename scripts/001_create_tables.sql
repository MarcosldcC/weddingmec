-- Wedding Gift List Database Schema

-- Create gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'almost_complete', 'complete')),
  reserved_count INTEGER DEFAULT 0,
  total_needed INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  color TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pix_contributions table
CREATE TABLE IF NOT EXISTS pix_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_gifts_category ON gifts(category);
CREATE INDEX IF NOT EXISTS idx_reservations_gift_id ON reservations(gift_id);
CREATE INDEX IF NOT EXISTS idx_pix_contributions_created_at ON pix_contributions(created_at DESC);
