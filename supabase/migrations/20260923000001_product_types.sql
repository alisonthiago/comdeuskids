-- O formato comercial é independente da categoria editorial.
-- Produtos antigos ficam sem tipo até serem classificados no cadastro.
ALTER TABLE public.products
  ADD COLUMN product_type TEXT
  CHECK (product_type IN ('curso', 'arquivo', 'serie', 'musica', 'jogo', 'filme', 'video', 'brincadeira'));
