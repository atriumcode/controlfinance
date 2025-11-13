-- Adicionar coluna logo_url à tabela companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Adicionar comentário
COMMENT ON COLUMN companies.logo_url IS 'URL do logo da empresa armazenado no Vercel Blob';
