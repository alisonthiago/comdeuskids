-- Metadados editoriais para os cadastros do CMS.
-- Mantém compatibilidade com conteúdos já publicados.
ALTER TABLE public.stream_contents
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS stream_contents_metadata_gin
  ON public.stream_contents USING GIN (metadata);
