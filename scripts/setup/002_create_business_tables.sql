-- ============================================================================
-- SCRIPT 002: Criar Tabelas de Negócio
-- ============================================================================
-- Descrição: Cria tabelas de clientes, notas fiscais e itens
-- Ordem de execução: 2
-- Dependências: 001_create_base_tables.sql
-- ============================================================================

-- ============================================================================
-- TABELA: clients
-- Descrição: Clientes das empresas
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
COMMENT ON COLUMN clients.document IS 'CPF ou CNPJ do cliente';
COMMENT ON COLUMN clients.document_type IS 'Tipo de documento: cpf ou cnpj';

-- ============================================================================
-- TABELA: invoices
-- Descrição: Notas fiscais emitidas/recebidas
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

COMMENT ON TABLE invoices IS 'Notas fiscais do sistema';
COMMENT ON COLUMN invoices.nfe_key IS 'Chave da NF-e (44 dígitos)';
COMMENT ON COLUMN invoices.status IS 'Status: pending, partial, paid, overdue, cancelled';
COMMENT ON COLUMN invoices.amount_paid IS 'Valor já pago da nota fiscal';
COMMENT ON COLUMN invoices.xml_content IS 'Conteúdo XML da NF-e original';

-- ============================================================================
-- TABELA: invoice_items
-- Descrição: Itens das notas fiscais
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
COMMENT ON COLUMN invoice_items.quantity IS 'Quantidade (pode ser decimal: 1.500 kg)';
COMMENT ON COLUMN invoice_items.tax_rate IS 'Taxa de imposto em porcentagem';

-- ============================================================================
-- TABELA: payments
-- Descrição: Pagamentos das notas fiscais (suporta pagamento parcial)
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

COMMENT ON TABLE payments IS 'Histórico de pagamentos de notas fiscais';
COMMENT ON COLUMN payments.amount IS 'Valor do pagamento realizado';
COMMENT ON COLUMN payments.payment_method IS 'Método: pix, boleto, cartao, dinheiro, etc';

-- ============================================================================
-- ÍNDICES para melhor performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_nfe_key ON invoices(nfe_key);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- ============================================================================
-- TRIGGERS: Atualizar updated_at automaticamente
-- ============================================================================
CREATE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIM DO SCRIPT 002
-- ============================================================================
