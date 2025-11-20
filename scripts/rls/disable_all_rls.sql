-- =========================================================================
-- DESABILITAR RLS EM TODAS AS TABELAS
-- Este script remove todas as políticas e desabilita RLS
-- Use apenas para testes/desenvolvimento
-- =========================================================================

-- Remover todas as políticas RLS
DROP POLICY IF EXISTS "companies_select_own" ON companies;
DROP POLICY IF EXISTS "companies_insert_own" ON companies;
DROP POLICY IF EXISTS "companies_update_own" ON companies;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;

DROP POLICY IF EXISTS "sessions_select_own" ON sessions;
DROP POLICY IF EXISTS "sessions_insert_own" ON sessions;
DROP POLICY IF EXISTS "sessions_update_own" ON sessions;
DROP POLICY IF EXISTS "sessions_delete_own" ON sessions;

DROP POLICY IF EXISTS "clients_select_company" ON clients;
DROP POLICY IF EXISTS "clients_insert_company" ON clients;
DROP POLICY IF EXISTS "clients_update_company" ON clients;
DROP POLICY IF EXISTS "clients_delete_company" ON clients;

DROP POLICY IF EXISTS "invoices_select_company" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_company" ON invoices;
DROP POLICY IF EXISTS "invoices_update_company" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_company" ON invoices;

DROP POLICY IF EXISTS "invoice_items_select_via_invoice" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert_via_invoice" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_update_via_invoice" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_delete_via_invoice" ON invoice_items;

DROP POLICY IF EXISTS "payments_select_company" ON payments;
DROP POLICY IF EXISTS "payments_insert_company" ON payments;
DROP POLICY IF EXISTS "payments_update_company" ON payments;

DROP POLICY IF EXISTS "certificates_select_company" ON certificates;
DROP POLICY IF EXISTS "certificates_insert_company" ON certificates;
DROP POLICY IF EXISTS "certificates_update_company" ON certificates;

DROP POLICY IF EXISTS "audit_logs_select_company" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_all" ON audit_logs;

DROP POLICY IF EXISTS "import_history_select_company" ON import_history;
DROP POLICY IF EXISTS "import_history_insert_company" ON import_history;

-- Remover funções helper
DROP FUNCTION IF EXISTS get_user_company_id();
DROP FUNCTION IF EXISTS get_user_role();
DROP FUNCTION IF EXISTS is_admin_or_manager();

-- Desabilitar RLS em todas as tabelas
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE import_history DISABLE ROW LEVEL SECURITY;

-- Confirmar status
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

\echo '=========================================================================='
\echo 'RLS DESABILITADO EM TODAS AS TABELAS'
\echo 'Sistema voltou ao estado funcional para testes'
\echo '=========================================================================='
