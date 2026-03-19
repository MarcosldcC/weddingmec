-- Bucket para imagens dos presentes (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-images', 'gift-images', true)
ON CONFLICT (name) DO NOTHING;
