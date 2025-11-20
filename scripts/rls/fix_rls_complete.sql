-- ==================================================================================
-- CORREÇÃO COMPLETA DE RLS - SEM RECURSÃO INFINITA
-- ==================================================================================
-- Este script corrige o problema de recursão infinita nas políticas RLS
-- criando funções helper que não disparam políticas ao serem executadas
-- ==================================================================================

-- ==================================================================================
-- ETAPA 1: CRIAR FUNÇÕES HELPER (SECURITY DEFINER)
-- ==================================================================================

-- Função para obter company_id do usuário atual
CREATE OR REPLACE FUNCTION auth.get_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Função para verificar se usuário é admin ou manager
CREATE OR REPLACE FUNCTION auth.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  );
$$;

-- ==================================================================================
-- ETAPA 2: REMOVER POLÍTICAS ANTIGAS
-- ==================================================================================

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

-- Clients
DROP POLICY IF EXISTS "clients_select_own" ON clients;
DROP POLICY IF EXISTS "clients_insert_own" ON clients;
DROP POLICY IF EXISTS "clients_update_own" ON clients;
DROP POLICY IF EXISTS "clients_delete_own" ON clients;

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

-- Audit Logs
DROP POLICY IF EXISTS "audit_logs_select_own" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_own" ON audit_logs;

-- Import History
DROP POLICY IF EXISTS "import_history_select_own" ON import_history;
DROP POLICY IF EXISTS "import_history_insert_own" ON import_history;

-- ==================================================================================
-- ETAPA 3: CRIAR POLÍTICAS NOVAS (SEM RECURSÃO)
-- ==================================================================================

-- ==================================================================================
-- COMPANIES - Dados da empresa
-- ==================================================================================

CREATE POLICY "companies_select_own" ON companies
  FOR SELECT
  USING (id = auth.get_user_company_id());

CREATE POLICY "companies_insert_own" ON companies
  FOR INSERT
  WITH CHECK (true); -- Permite criar empresa no registro

CREATE POLICY "companies_update_own" ON companies
  FOR UPDATE
  USING (id = auth.get_user_company_id() AND auth.is_admin_or_manager());

CREATE POLICY "companies_delete_admin" ON companies
  FOR DELETE
  USING (id = auth.get_user_company_id() AND auth.get_user_role() = 'admin');

-- ==================================================================================
-- PROFILES - Usuários do sistema
-- ==================================================================================

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (
    id = auth.uid() OR 
    company_id = auth.get_user_company_id()
  );

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (true); -- Permite criar perfil no registro

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (
    id = auth.uid() OR 
    (company_id = auth.get_user_company_id() AND auth.is_admin_or_manager())
  );

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE
  USING (
    company_id = auth.get_user_company_id() AND 
    auth.get_user_role() = 'admin' AND
    id != auth.uid() -- Não pode deletar a si mesmo
  );

-- ==================================================================================
-- CLIENTS - Clientes
-- ==================================================================================

CREATE POLICY "clients_select_own" ON clients
  FOR SELECT
  USING (company_id = auth.get_user_company_id());

CREATE POLICY "clients_insert_own" ON clients
  FOR INSERT
  WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "clients_update_own" ON clients
  FOR UPDATE
  USING (company_id = auth.get_user_company_id());

CREATE POLICY "clients_delete_own" ON clients
  FOR DELETE
  USING (company_id = auth.get_user_company_id() AND auth.is_admin_or_manager());

-- ==================================================================================
-- INVOICES - Notas Fiscais
-- ==================================================================================

CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT
  USING (company_id = auth.get_user_company_id());

CREATE POLICY "invoices_insert_own" ON invoices
  FOR INSERT
  WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "invoices_update_own" ON invoices
  FOR UPDATE
  USING (company_id = auth.get_user_company_id());

CREATE POLICY "invoices_delete_admin" ON invoices
  FOR DELETE
  USING (company_id = auth.get_user_company_id() AND auth.is_admin_or_manager());

-- ==================================================================================
-- INVOICE_ITEMS - Itens da Nota Fiscal
-- ==================================================================================

CREATE POLICY "invoice_items_select_own" ON invoice_items
  FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id = auth.get_user_company_id()
    )
  );

CREATE POLICY "invoice_items_insert_own" ON invoice_items
  FOR INSERT
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id = auth.get_user_company_id()
    )
  );

CREATE POLICY "invoice_items_update_own" ON invoice_items
  FOR UPDATE
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id = auth.get_user_company_id()
    )
  );

CREATE POLICY "invoice_items_delete_own" ON invoice_items
  FOR DELETE
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id = auth.get_user_company_id()
    )
  );

-- ==================================================================================
-- PAYMENTS - Pagamentos
-- ==================================================================================

CREATE POLICY "payments_select_own" ON payments
  FOR SELECT
  USING (company_id = auth.get_user_company_id());

CREATE POLICY "payments_insert_own" ON payments
  FOR INSERT
  WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "payments_update_own" ON payments
  FOR UPDATE
  USING (company_id = auth.get_user_company_id());

CREATE POLICY "payments_delete_admin" ON payments
  FOR DELETE
  USING (company_id = auth.get_user_company_id() AND auth.is_admin_or_manager());

-- ==================================================================================
-- CERTIFICATES - Certificados Digitais
-- ==================================================================================

CREATE POLICY "certificates_select_own" ON certificates
  FOR SELECT
  USING (company_id = auth.get_user_company_id());

CREATE POLICY "certificates_insert_own" ON certificates
  FOR INSERT
  WITH CHECK (company_id = auth.get_user_company_id() AND auth.is_admin_or_manager());

CREATE POLICY "certificates_update_own" ON certificates
  FOR UPDATE
  USING (company_id = auth.get_user_company_id() AND auth.is_admin_or_manager());

CREATE POLICY "certificates_delete_admin" ON certificates
  FOR DELETE
  USING (company_id = auth.get_user_company_id() AND auth.get_user_role() = 'admin');

-- ==================================================================================
-- AUDIT_LOGS - Logs de Auditoria
-- ==================================================================================

CREATE POLICY "audit_logs_select_own" ON audit_logs
  FOR SELECT
  USING (company_id = auth.get_user_company_id());

CREATE POLICY "audit_logs_insert_own" ON audit_logs
  FOR INSERT
  WITH CHECK (company_id = auth.get_user_company_id());

-- ==================================================================================
-- IMPORT_HISTORY - Histórico de Importações
-- ==================================================================================

CREATE POLICY "import_history_select_own" ON import_history
  FOR SELECT
  USING (company_id = auth.get_user_company_id());

CREATE POLICY "import_history_insert_own" ON import_history
  FOR INSERT
  WITH CHECK (company_id = auth.get_user_company_id());

-- ==================================================================================
-- ETAPA 4: HABILITAR RLS EM TODAS AS TABELAS
-- ==================================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- ==================================================================================
-- CONCLUÍDO!
-- ==================================================================================
-- As políticas RLS foram configuradas corretamente sem recursão infinita.
-- As funções helper usam SECURITY DEFINER para evitar loops.
-- ==================================================================================
