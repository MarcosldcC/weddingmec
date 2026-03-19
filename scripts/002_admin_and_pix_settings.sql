-- Admins: controlam quem pode acessar/configurar o painel administrativo
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pix settings: chave e QR (URL/bitmap) exibidos na página /pix
CREATE TABLE IF NOT EXISTS pix_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  pix_key TEXT,
  pix_qr_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garante uma linha base para facilitar GET/PUT
INSERT INTO pix_settings (id, pix_key, pix_qr_url)
VALUES (1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

