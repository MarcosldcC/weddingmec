-- Bucket para QR code do PIX (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pix-qr-images', 'pix-qr-images', true)
ON CONFLICT (name) DO NOTHING;
