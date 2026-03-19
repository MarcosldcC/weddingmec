-- Admins
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pix settings
CREATE TABLE IF NOT EXISTS pix_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  pix_key TEXT,
  pix_qr_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pix_settings (id, pix_key, pix_qr_url)
VALUES (1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;
