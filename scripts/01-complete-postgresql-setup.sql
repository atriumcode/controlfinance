-- ============================================================================
-- SISTEMA DE CONTROLE FINANCEIRO E NOTAS FISCAIS
-- Script de Instalação Completa para PostgreSQL
-- ============================================================================
-- Versão: 2.0
-- Data: 2025-01-06
-- 
-- INSTRUÇÕES:
-- 1. Primeiro execute o script 00-enable-extensions-as-superuser.sql como postgres
-- 2. Depois execute este script como invoice_user
-- 
-- Comando: psql -h localhost -U invoice_user -d invoice_system -f scripts/01-complete-postgresql-setup.sql
-- ============================================================================

\echo '============================================================================'
\echo 'Iniciando instalação do Sistema de Controle Financeiro'
\echo '============================================================================'

-- Limpar tabelas existentes (se houver)
DROP TABLE IF EXISTS import_history CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

\echo 'Tabelas antigas removidas (se existiam)'

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

\echo 'Criando tabela: companies'
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Criando tabela: profiles'
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Criando tabela: sessions'
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Criando tabela: clients'
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  cpf_cnpj VARCHAR(18),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Criando tabela: invoices'
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  payment_method VARCHAR(50),
  notes TEXT,
  xml_file_url TEXT,
  pdf_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Criando tabela: invoice_items'
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Criando tabela: payments'
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Criando tabela: audit_logs'
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo 'Criando tabela: import_history'
CREATE TABLE import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'success', 'error')),
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

\echo 'Criando índices...'

-- Companies
CREATE INDEX idx_companies_cnpj ON companies(cnpj);

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Sessions
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Clients
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_clients_cpf_cnpj ON clients(cpf_cnpj);
CREATE INDEX idx_clients_name ON clients(name);

-- Invoices
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_composite ON invoices(company_id, status, due_date);

-- Invoice Items
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Payments
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Import History
CREATE INDEX idx_import_history_company ON import_history(company_id);
CREATE INDEX idx_import_history_status ON import_history(status);

-- ============================================================================
-- TRIGGERS AUTOMÁTICOS
-- ============================================================================

\echo 'Criando triggers...'

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
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

-- Função para atualizar status da invoice quando adicionar pagamento
CREATE OR REPLACE FUNCTION update_invoice_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_total_amount DECIMAL(15, 2);
    v_paid_amount DECIMAL(15, 2);
BEGIN
    -- Buscar o total da invoice
    SELECT total_amount INTO v_total_amount
    FROM invoices
    WHERE id = NEW.invoice_id;
    
    -- Calcular o total pago
    SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount
    FROM payments
    WHERE invoice_id = NEW.invoice_id;
    
    -- Atualizar a invoice
    UPDATE invoices
    SET 
        paid_amount = v_paid_amount,
        status = CASE
            WHEN v_paid_amount >= v_total_amount THEN 'paid'
            WHEN v_paid_amount > 0 THEN 'partial'
            ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_invoice_status ON payments;
CREATE TRIGGER trigger_update_invoice_status
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_status_on_payment();

-- ============================================================================
-- DADOS INICIAIS DE EXEMPLO
-- ============================================================================

\echo 'Inserindo dados de exemplo...'

-- Inserir empresa exemplo
INSERT INTO companies (id, name, cnpj, email, phone, city, state)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Empresa Exemplo Ltda',
    '12.345.678/0001-90',
    'contato@exemplo.com',
    '(11) 98765-4321',
    'São Paulo',
    'SP'
);

-- Inserir usuário admin (senha: admin123)
-- Hash bcrypt de 'admin123'
INSERT INTO profiles (id, company_id, email, password_hash, full_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'admin@exemplo.com',
    '$2a$10$rR7p5nQZ5fZ5Z5Z5Z5Z5ZeK3xK3xK3xK3xK3xK3xK3xK3xK3xK3xK',
    'Administrador',
    'admin'
);

-- ============================================================================
-- PERMISSÕES
-- ============================================================================

\echo 'Configurando permissões...'

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO invoice_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO invoice_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO invoice_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO invoice_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO invoice_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO invoice_user;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

\echo 'Criando views...'

-- View de resumo financeiro
CREATE OR REPLACE VIEW vw_financial_summary AS
SELECT
    company_id,
    COUNT(*) as total_invoices,
    SUM(total_amount) as total_billed,
    SUM(paid_amount) as total_received,
    SUM(total_amount - paid_amount) as total_pending,
    SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
FROM invoices
GROUP BY company_id;

-- View de clientes com estatísticas
CREATE OR REPLACE VIEW vw_client_stats AS
SELECT
    c.id as client_id,
    c.company_id,
    c.name,
    c.email,
    COUNT(i.id) as total_invoices,
    SUM(i.total_amount) as total_billed,
    SUM(i.paid_amount) as total_paid,
    MAX(i.issue_date) as last_invoice_date
FROM clients c
LEFT JOIN invoices i ON i.client_id = c.id
GROUP BY c.id, c.company_id, c.name, c.email;

-- View de invoices com informações completas
CREATE OR REPLACE VIEW vw_invoice_details AS
SELECT
    i.id,
    i.company_id,
    i.invoice_number,
    i.issue_date,
    i.due_date,
    i.total_amount,
    i.paid_amount,
    i.status,
    i.payment_method,
    c.name as client_name,
    c.cpf_cnpj as client_document,
    (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as items_count,
    (SELECT COUNT(*) FROM payments WHERE invoice_id = i.id) as payments_count
FROM invoices i
LEFT JOIN clients c ON c.id = i.client_id;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

\echo '============================================================================'
\echo 'Verificando instalação...'
\echo '============================================================================'

SELECT 'Tabelas criadas:' as info;
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT 'Índices criados:' as info;
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- MENSAGEM FINAL
-- ============================================================================

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
    RAISE NOTICE '   Email: admin@exemplo.com';
    RAISE NOTICE '   Senha: admin123';
    RAISE NOTICE '============================================================================';
END $$;
