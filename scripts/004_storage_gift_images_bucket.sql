-- Bucket para imagens dos presentes
-- Publico para que a página de guests `/gifts` consiga exibir a imagem pela URL.
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-images', 'gift-images', true)
ON CONFLICT (name) DO NOTHING;

