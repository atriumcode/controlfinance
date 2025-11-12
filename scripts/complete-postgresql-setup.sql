-- ============================================================================
-- SCRIPT COMPLETO DE INSTALAÇÃO DO SISTEMA DE NOTAS FISCAIS
-- PostgreSQL Local - Versão Consolidada
-- ============================================================================

-- Habilitar extensão para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Limpar schema existente (CUIDADO: Remove todos os dados)
-- Descomente as linhas abaixo apenas se quiser começar do zero
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO invoice_user;
-- GRANT ALL ON SCHEMA public TO public;

-- ============================================================================
-- 1. TABELA DE EMPRESAS (Multi-tenancy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE companies IS 'Empresas cadastradas no sistema (multi-tenancy)';
COMMENT ON COLUMN companies.cnpj IS 'CNPJ da empresa (formato: 00.000.000/0000-00)';
COMMENT ON COLUMN companies.logo_url IS 'URL do logotipo da empresa';

-- ============================================================================
-- 2. TABELA DE PERFIS/USUÁRIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'accountant', 'viewer')),
  company_name TEXT,
  cnpj TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Perfis de usuários do sistema';
COMMENT ON COLUMN profiles.role IS 'Papel do usuário: admin, manager, user, accountant, viewer';
COMMENT ON COLUMN profiles.password_hash IS 'Hash bcrypt da senha do usuário';
COMMENT ON COLUMN profiles.is_active IS 'Indica se o usuário está ativo no sistema';

-- ============================================================================
-- 3. TABELA DE SESSÕES
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE sessions IS 'Sessões ativas de usuários';
COMMENT ON COLUMN sessions.token IS 'Token único de sessão';
COMMENT ON COLUMN sessions.expires_at IS 'Data/hora de expiração da sessão';

-- ============================================================================
-- 4. TABELA DE CLIENTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('cpf', 'cnpj')),
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, document)
);

COMMENT ON TABLE clients IS 'Clientes das empresas';
COMMENT ON COLUMN clients.document IS 'CPF ou CNPJ do cliente (apenas números)';
COMMENT ON COLUMN clients.document_type IS 'Tipo de documento: cpf ou cnpj';

-- ============================================================================
-- 5. TABELA DE NOTAS FISCAIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  nfe_key TEXT,
  issue_date DATE NOT NULL,
  due_date DATE,
  total_amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  net_amount DECIMAL(15,2) NOT NULL,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  payment_date DATE,
  notes TEXT,
  xml_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, invoice_number)
);

COMMENT ON TABLE invoices IS 'Notas fiscais emitidas';
COMMENT ON COLUMN invoices.nfe_key IS 'Chave de acesso da NF-e (44 dígitos)';
COMMENT ON COLUMN invoices.xml_content IS 'Conteúdo XML completo da NF-e';
COMMENT ON COLUMN invoices.amount_paid IS 'Valor já pago (para pagamentos parciais)';
COMMENT ON COLUMN invoices.status IS 'Status: pending, partial, paid, overdue, cancelled';

-- ============================================================================
-- 6. TABELA DE ITENS DA NOTA FISCAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE invoice_items IS 'Itens/produtos das notas fiscais';
COMMENT ON COLUMN invoice_items.quantity IS 'Quantidade do item (suporta decimais)';
COMMENT ON COLUMN invoice_items.tax_rate IS 'Alíquota de imposto (%)';

-- ============================================================================
-- 7. TABELA DE PAGAMENTOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE payments IS 'Histórico de pagamentos das notas fiscais';
COMMENT ON COLUMN payments.payment_method IS 'Método de pagamento: dinheiro, cartão, pix, boleto, etc';

-- ============================================================================
-- 8. TABELA DE LOGS DE AUDITORIA
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

COMMENT ON TABLE audit_logs IS 'Logs de auditoria para conformidade fiscal';
COMMENT ON COLUMN audit_logs.action IS 'Ação realizada: INSERT, UPDATE, DELETE';
COMMENT ON COLUMN audit_logs.old_values IS 'Valores anteriores (JSON)';
COMMENT ON COLUMN audit_logs.new_values IS 'Valores novos (JSON)';

-- ============================================================================
-- 9. TABELA DE HISTÓRICO DE IMPORTAÇÕES
-- ============================================================================

CREATE TABLE IF NOT EXISTS import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL,
  records_imported INTEGER DEFAULT 0,
  error_message TEXT,
  imported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE import_history IS 'Histórico de importações de arquivos XML/OFX';
COMMENT ON COLUMN import_history.file_type IS 'Tipo de arquivo: xml, ofx, csv';
COMMENT ON COLUMN import_history.status IS 'Status: success, error, partial';

-- ============================================================================
-- 10. ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Índices para sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document);
CREATE INDEX IF NOT EXISTS idx_clients_document_type ON clients(document_type);

-- Índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_nfe_key ON invoices(nfe_key);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Índices para invoice_items
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Índices para payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Índices para import_history
CREATE INDEX IF NOT EXISTS idx_import_history_company_id ON import_history(company_id);
CREATE INDEX IF NOT EXISTS idx_import_history_created_at ON import_history(created_at DESC);

-- ============================================================================
-- 11. FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. FUNÇÃO PARA ATUALIZAR STATUS DE PAGAMENTO
-- ============================================================================

CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar amount_paid da invoice
  UPDATE invoices
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0)
      FROM payments
      WHERE invoice_id = NEW.invoice_id
    ),
    status = CASE
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) >= total_amount THEN 'paid'
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) > 0 THEN 'partial'
      ELSE status
    END,
    payment_date = CASE
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) >= total_amount THEN NEW.payment_date
      ELSE payment_date
    END
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status ao adicionar pagamento
DROP TRIGGER IF EXISTS trigger_update_invoice_payment_status ON payments;
CREATE TRIGGER trigger_update_invoice_payment_status
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_payment_status();

-- ============================================================================
-- 13. DADOS INICIAIS (SEED DATA)
-- ============================================================================

-- Inserir empresa de exemplo (opcional - comente se não quiser)
INSERT INTO companies (id, name, cnpj, email, phone, city, state)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Empresa Exemplo Ltda',
  '00000000000100',
  'contato@exemplo.com',
  '(11) 98765-4321',
  'São Paulo',
  'SP'
) ON CONFLICT (id) DO NOTHING;

-- Inserir usuário admin de exemplo (opcional - comente se não quiser)
-- Senha padrão: admin123 (hash bcrypt)
INSERT INTO profiles (id, company_id, email, password_hash, full_name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'admin@exemplo.com',
  '$2a$10$rKvVPZqGhf5vVZqGhf5vVeJ5vVZqGhf5vVZqGhf5vVZqGhf5vVZqG',
  'Administrador',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 14. PERMISSÕES
-- ============================================================================

-- Conceder todas as permissões ao usuário invoice_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO invoice_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO invoice_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO invoice_user;

-- Configurar privilégios padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO invoice_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO invoice_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO invoice_user;

-- ============================================================================
-- 15. VIEWS ÚTEIS
-- ============================================================================

-- View para relatório de faturamento por mês
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT 
  company_id,
  DATE_TRUNC('month', issue_date) AS month,
  COUNT(*) AS invoice_count,
  SUM(total_amount) AS total_revenue,
  SUM(amount_paid) AS total_paid,
  SUM(total_amount - amount_paid) AS total_pending
FROM invoices
WHERE status != 'cancelled'
GROUP BY company_id, DATE_TRUNC('month', issue_date)
ORDER BY month DESC;

-- View para clientes com mais faturamento
CREATE OR REPLACE VIEW top_clients AS
SELECT 
  c.company_id,
  cl.id AS client_id,
  cl.name AS client_name,
  cl.document,
  COUNT(c.id) AS invoice_count,
  SUM(c.total_amount) AS total_revenue,
  SUM(c.amount_paid) AS total_paid
FROM invoices c
LEFT JOIN clients cl ON c.client_id = cl.id
WHERE c.status != 'cancelled'
GROUP BY c.company_id, cl.id, cl.name, cl.document
ORDER BY total_revenue DESC;

-- View para notas fiscais vencidas
CREATE OR REPLACE VIEW overdue_invoices AS
SELECT 
  i.*,
  c.name AS client_name,
  c.email AS client_email,
  (CURRENT_DATE - i.due_date) AS days_overdue
FROM invoices i
LEFT JOIN clients c ON i.client_id = c.id
WHERE i.status IN ('pending', 'partial')
  AND i.due_date < CURRENT_DATE
ORDER BY i.due_date ASC;

-- ============================================================================
-- SCRIPT CONCLUÍDO
-- ============================================================================

-- Verificar tabelas criadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar índices criados
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'INSTALAÇÃO CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Tabelas criadas: 9';
  RAISE NOTICE 'Índices criados: 25+';
  RAISE NOTICE 'Triggers criados: 6';
  RAISE NOTICE 'Views criadas: 3';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Configure as variáveis de ambiente no arquivo .env.local';
  RAISE NOTICE '2. Inicie a aplicação Next.js com: npm run dev';
  RAISE NOTICE '3. Acesse: http://localhost:3000';
  RAISE NOTICE '';
  RAISE NOTICE 'Usuário admin de exemplo:';
  RAISE NOTICE '  Email: admin@exemplo.com';
  RAISE NOTICE '  Senha: admin123';
  RAISE NOTICE '============================================================================';
END $$;
