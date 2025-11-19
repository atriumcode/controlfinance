-- ============================================================================
-- SCRIPT 004: Configurar Row Level Security (RLS)
-- ============================================================================
-- Descrição: Habilita e configura políticas de segurança em nível de linha
-- Ordem de execução: 4
-- Dependências: Todas as tabelas criadas nos scripts anteriores
-- ============================================================================

-- ============================================================================
-- HABILITAR RLS em todas as tabelas
-- ============================================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- Nota: certificates não usa RLS pois usa lógica própria de permissões

-- ============================================================================
-- POLÍTICAS: companies
-- ============================================================================
CREATE POLICY "companies_select_own" ON companies
  FOR SELECT
  USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "companies_insert_own" ON companies
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "companies_update_own" ON companies
  FOR UPDATE
  USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "companies_delete_own" ON companies
  FOR DELETE
  USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- POLÍTICAS: profiles
-- ============================================================================
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (
    id = auth.uid() OR
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (
    id = auth.uid() OR
    (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')))
  );

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- POLÍTICAS: sessions
-- ============================================================================
CREATE POLICY "Enable all access for sessions" ON sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- POLÍTICAS: clients
-- ============================================================================
CREATE POLICY "clients_select_own" ON clients
  FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "clients_insert_own" ON clients
  FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "clients_update_own" ON clients
  FOR UPDATE
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "clients_delete_own" ON clients
  FOR DELETE
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- ============================================================================
-- POLÍTICAS: invoices
-- ============================================================================
CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "invoices_insert_own" ON invoices
  FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "invoices_update_own" ON invoices
  FOR UPDATE
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "invoices_delete_own" ON invoices
  FOR DELETE
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- ============================================================================
-- POLÍTICAS: invoice_items
-- ============================================================================
CREATE POLICY "invoice_items_select_own" ON invoice_items
  FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "invoice_items_insert_own" ON invoice_items
  FOR INSERT
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "invoice_items_update_own" ON invoice_items
  FOR UPDATE
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "invoice_items_delete_own" ON invoice_items
  FOR DELETE
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- POLÍTICAS: payments
-- ============================================================================
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "payments_insert_own" ON payments
  FOR INSERT
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- POLÍTICAS: audit_logs
-- ============================================================================
CREATE POLICY "audit_logs_select_own" ON audit_logs
  FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- POLÍTICAS: import_history
-- ============================================================================
CREATE POLICY "import_history_select_own" ON import_history
  FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "import_history_insert_own" ON import_history
  FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- FIM DO SCRIPT 004
-- ============================================================================
