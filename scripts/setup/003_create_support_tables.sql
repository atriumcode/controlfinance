-- ============================================================================
-- SCRIPT 003: Criar Tabelas de Suporte
-- ============================================================================
-- Descrição: Cria tabelas de auditoria, certificados e histórico de importação
-- Ordem de execução: 3
-- Dependências: 001_create_base_tables.sql, 002_create_business_tables.sql
-- ============================================================================

-- ============================================================================
-- TABELA: audit_logs
-- Descrição: Logs de auditoria para compliance
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Registro de auditoria de todas as operações do sistema';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de ação: INSERT, UPDATE, DELETE';
COMMENT ON COLUMN audit_logs.table_name IS 'Nome da tabela afetada';
COMMENT ON COLUMN audit_logs.old_values IS 'Valores antigos (formato JSON)';
COMMENT ON COLUMN audit_logs.new_values IS 'Valores novos (formato JSON)';

-- ============================================================================
-- TABELA: certificates
-- Descrição: Certidões negativas e documentos com controle de vencimento
-- ============================================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_date DATE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE certificates IS 'Certidões negativas e documentos com controle de vencimento';
COMMENT ON COLUMN certificates.file_url IS 'URL do arquivo no Vercel Blob Storage';
COMMENT ON COLUMN certificates.expiration_date IS 'Data de vencimento da certidão';
COMMENT ON COLUMN certificates.created_by IS 'Usuário que fez o upload';

-- ============================================================================
-- TABELA: import_history
-- Descrição: Histórico de importações de arquivos (NF-e XML, OFX, etc)
-- ============================================================================
CREATE TABLE IF NOT EXISTS import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  records_imported INTEGER DEFAULT 0,
  error_message TEXT,
  imported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE import_history IS 'Histórico de importações de arquivos XML/OFX';
COMMENT ON COLUMN import_history.file_type IS 'Tipo: xml, ofx, csv';
COMMENT ON COLUMN import_history.status IS 'Status: success, error, partial';
COMMENT ON COLUMN import_history.records_imported IS 'Número de registros importados com sucesso';

-- ============================================================================
-- ÍNDICES para melhor performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_certificates_company_id ON certificates(company_id);
CREATE INDEX IF NOT EXISTS idx_certificates_expiration ON certificates(expiration_date);
CREATE INDEX IF NOT EXISTS idx_certificates_created_by ON certificates(created_by);
CREATE INDEX IF NOT EXISTS idx_import_history_company_id ON import_history(company_id);
CREATE INDEX IF NOT EXISTS idx_import_history_created_at ON import_history(created_at DESC);

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================
CREATE TRIGGER trigger_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS: Certidões vigentes e vencidas
-- ============================================================================
CREATE OR REPLACE VIEW valid_certificates AS
SELECT 
  c.*,
  p.full_name as created_by_name,
  (c.expiration_date - CURRENT_DATE) as days_until_expiration
FROM certificates c
LEFT JOIN profiles p ON c.created_by = p.id
WHERE c.expiration_date >= CURRENT_DATE
ORDER BY c.expiration_date ASC;

COMMENT ON VIEW valid_certificates IS 'Certidões vigentes (não vencidas)';

CREATE OR REPLACE VIEW expired_certificates AS
SELECT 
  c.*,
  p.full_name as created_by_name,
  (CURRENT_DATE - c.expiration_date) as days_expired
FROM certificates c
LEFT JOIN profiles p ON c.created_by = p.id
WHERE c.expiration_date < CURRENT_DATE
ORDER BY c.expiration_date DESC;

COMMENT ON VIEW expired_certificates IS 'Certidões vencidas';

-- ============================================================================
-- FIM DO SCRIPT 003
-- ============================================================================
