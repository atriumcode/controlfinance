-- Criar tabela de certidões
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_date DATE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_certificates_company ON certificates(company_id);
CREATE INDEX idx_certificates_expiration ON certificates(expiration_date);
CREATE INDEX idx_certificates_created_by ON certificates(created_by);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificates_updated_at();

-- View para certidões vigentes
CREATE OR REPLACE VIEW valid_certificates AS
SELECT 
  c.*,
  p.full_name as created_by_name,
  (c.expiration_date - CURRENT_DATE) as days_until_expiration
FROM certificates c
LEFT JOIN profiles p ON c.created_by = p.id
WHERE c.expiration_date >= CURRENT_DATE
ORDER BY c.expiration_date ASC;

-- View para certidões vencidas
CREATE OR REPLACE VIEW expired_certificates AS
SELECT 
  c.*,
  p.full_name as created_by_name,
  (CURRENT_DATE - c.expiration_date) as days_expired
FROM certificates c
LEFT JOIN profiles p ON c.created_by = p.id
WHERE c.expiration_date < CURRENT_DATE
ORDER BY c.expiration_date DESC;

-- Comentários
COMMENT ON TABLE certificates IS 'Armazena certidões negativas e outros documentos com controle de vencimento';
COMMENT ON COLUMN certificates.expiration_date IS 'Data de vencimento da certidão';
COMMENT ON COLUMN certificates.file_url IS 'URL do arquivo no Vercel Blob Storage';
