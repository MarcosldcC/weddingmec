-- Bucket para QR code do PIX
-- Publico para a página `/pix` conseguir renderizar via URL.
INSERT INTO storage.buckets (id, name, public)
VALUES ('pix-qr-images', 'pix-qr-images', true)
ON CONFLICT (name) DO NOTHING;

