-- ============================================================================
-- CORREÇÃO COMPLETA DE RLS SEM RECURSÃO INFINITA
-- ============================================================================
-- Este script corrige as políticas RLS que causavam recursão infinita
-- Versão corrigida: usa schema public e abordagem simplificada
-- ============================================================================

\echo '=========================================================================='
\echo 'ETAPA 1/4: Criando funções helper no schema PUBLIC...'
\echo '=========================================================================='

-- Função para obter company_id do usuário atual (sem recursão)
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_company_id UUID;
BEGIN
  -- Usa uma query simples com SET search_path para evitar recursão
  SELECT company_id INTO user_company_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_company_id;
END;
$$;

-- Função para obter role do usuário atual (sem recursão)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_role;
END;
$$;

-- Função para verificar se usuário é admin ou manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN public.get_current_user_role() IN ('admin', 'manager');
END;
$$;

\echo '=========================================================================='
\echo 'ETAPA 2/4: Removendo políticas antigas...'
\echo '=========================================================================='

-- Companies
DROP POLICY IF EXISTS "companies_select_own" ON companies;
DROP POLICY IF EXISTS "companies_insert_own" ON companies;
DROP POLICY IF EXISTS "companies_update_own" ON companies;
DROP POLICY IF EXISTS "companies_delete_admin" ON companies;

-- Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

-- Sessions
DROP POLICY IF EXISTS "sessions_select_own" ON sessions;
DROP POLICY IF EXISTS "sessions_insert_own" ON sessions;
DROP POLICY IF EXISTS "sessions_delete_own" ON sessions;

-- Clients
DROP POLICY IF EXISTS "clients_select_own" ON clients;
DROP POLICY IF EXISTS "clients_insert_own" ON clients;
DROP POLICY IF EXISTS "clients_update_own" ON clients;
DROP POLICY IF EXISTS "clients_delete_admin" ON clients;

-- Invoices
DROP POLICY IF EXISTS "invoices_select_own" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_own" ON invoices;
DROP POLICY IF EXISTS "invoices_update_own" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_admin" ON invoices;

-- Invoice Items
DROP POLICY IF EXISTS "invoice_items_select_own" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert_own" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_update_own" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_delete_own" ON invoice_items;

-- Payments
DROP POLICY IF EXISTS "payments_select_own" ON payments;
DROP POLICY IF EXISTS "payments_insert_own" ON payments;
DROP POLICY IF EXISTS "payments_update_own" ON payments;
DROP POLICY IF EXISTS "payments_delete_admin" ON payments;

-- Certificates
DROP POLICY IF EXISTS "certificates_select_own" ON certificates;
DROP POLICY IF EXISTS "certificates_insert_own" ON certificates;
DROP POLICY IF EXISTS "certificates_update_own" ON certificates;
DROP POLICY IF EXISTS "certificates_delete_admin" ON certificates;

-- Import History
DROP POLICY IF EXISTS "import_history_select_own" ON import_history;
DROP POLICY IF EXISTS "import_history_insert_own" ON import_history;

-- Audit Logs
DROP POLICY IF EXISTS "audit_logs_select_own" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_own" ON audit_logs;

\echo '=========================================================================='
\echo 'ETAPA 3/4: Criando políticas novas SEM recursão...'
\echo '=========================================================================='

-- ============================================================================
-- COMPANIES: Isolamento por company_id
-- ============================================================================

CREATE POLICY "companies_select_own" ON companies
  FOR SELECT
  USING (id = public.get_current_user_company_id());

CREATE POLICY "companies_insert_admin" ON companies
  FOR INSERT
  WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "companies_update_own" ON companies
  FOR UPDATE
  USING (id = public.get_current_user_company_id())
  WITH CHECK (id = public.get_current_user_company_id());

CREATE POLICY "companies_delete_admin" ON companies
  FOR DELETE
  USING (public.get_current_user_role() = 'admin');

-- ============================================================================
-- PROFILES: Isolamento por company_id
-- ============================================================================

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (
    id = auth.uid() OR 
    company_id = public.get_current_user_company_id()
  );

CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT
  WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (
    id = auth.uid() OR 
    (company_id = public.get_current_user_company_id() AND public.is_admin_or_manager())
  );

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE
  USING (
    company_id = public.get_current_user_company_id() AND 
    public.get_current_user_role() = 'admin'
  );

-- ============================================================================
-- SESSIONS: Apenas próprio usuário
-- ============================================================================

CREATE POLICY "sessions_select_own" ON sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "sessions_insert_own" ON sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_delete_own" ON sessions
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- CLIENTS: Isolamento por company_id
-- ============================================================================

CREATE POLICY "clients_select_own" ON clients
  FOR SELECT
  USING (company_id = public.get_current_user_company_id());

CREATE POLICY "clients_insert_own" ON clients
  FOR INSERT
  WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "clients_update_own" ON clients
  FOR UPDATE
  USING (company_id = public.get_current_user_company_id())
  WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "clients_delete_admin" ON clients
  FOR DELETE
  USING (
    company_id = public.get_current_user_company_id() AND 
    public.is_admin_or_manager()
  );

-- ============================================================================
-- INVOICES: Isolamento por company_id
-- ============================================================================

CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT
  USING (company_id = public.get_current_user_company_id());

CREATE POLICY "invoices_insert_own" ON invoices
  FOR INSERT
  WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "invoices_update_own" ON invoices
  FOR UPDATE
  USING (company_id = public.get_current_user_company_id())
  WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "invoices_delete_admin" ON invoices
  FOR DELETE
  USING (
    company_id = public.get_current_user_company_id() AND 
    public.is_admin_or_manager()
  );

-- ============================================================================
-- INVOICE_ITEMS: Isolamento via invoice
-- ============================================================================

CREATE POLICY "invoice_items_select_own" ON invoice_items
  FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id = public.get_current_user_company_id()
    )
  );

CREATE POLICY "invoice_items_insert_own" ON invoice_items
  FOR INSERT
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id = public.get_current_user_company_id()
    )
  );

CREATE POLICY "invoice_items_update_own" ON invoice_items
  FOR UPDATE
  USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id = public.get_current_user_company_id()
    )
  );

CREATE POLICY "invoice_items_delete_own" ON invoice_items
  FOR DELETE
  USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id = public.get_current_user_company_id()
    )
  );

-- ============================================================================
-- PAYMENTS: Isolamento por company_id
-- ============================================================================

CREATE POLICY "payments_select_own" ON payments
  FOR SELECT
  USING (company_id = public.get_current_user_company_id());

CREATE POLICY "payments_insert_own" ON payments
  FOR INSERT
  WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "payments_update_own" ON payments
  FOR UPDATE
  USING (company_id = public.get_current_user_company_id())
  WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "payments_delete_admin" ON payments
  FOR DELETE
  USING (
    company_id = public.get_current_user_company_id() AND 
    public.is_admin_or_manager()
  );

-- ============================================================================
-- CERTIFICATES: Isolamento por user_id
-- ============================================================================

CREATE POLICY "certificates_select_own" ON certificates
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "certificates_insert_own" ON certificates
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "certificates_update_own" ON certificates
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "certificates_delete_own" ON certificates
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- IMPORT_HISTORY: Isolamento por company_id
-- ============================================================================

CREATE POLICY "import_history_select_own" ON import_history
  FOR SELECT
  USING (company_id = public.get_current_user_company_id());

CREATE POLICY "import_history_insert_own" ON import_history
  FOR INSERT
  WITH CHECK (company_id = public.get_current_user_company_id());

-- ============================================================================
-- AUDIT_LOGS: Todos podem ver logs da sua empresa
-- ============================================================================

CREATE POLICY "audit_logs_select_own" ON audit_logs
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM profiles 
      WHERE company_id = public.get_current_user_company_id()
    )
  );

CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT
  WITH CHECK (true);  -- Sistema pode inserir logs de qualquer ação

\echo '=========================================================================='
\echo 'ETAPA 4/4: Habilitando RLS em todas as tabelas...'
\echo '=========================================================================='

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

\echo '=========================================================================='
\echo 'CONCLUÍDO! RLS configurado corretamente sem recursão infinita'
\echo '=========================================================================='
\echo ''
\echo 'Funções helper criadas em public schema:'
\echo '  - public.get_current_user_company_id()'
\echo '  - public.get_current_user_role()'
\echo '  - public.is_admin_or_manager()'
\echo ''
\echo 'Próximo passo: Teste salvar a empresa novamente'
\echo '=========================================================================='
