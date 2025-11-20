-- ============================================================================
-- SCRIPT DE REVERSÃO COMPLETA
-- Remove todas as políticas RLS e funções helper criadas
-- Garante RLS desabilitado em todas as tabelas
-- ============================================================================

\echo '=========================================================================='
\echo 'ETAPA 1/3: Removendo TODAS as políticas RLS...'
\echo '=========================================================================='

-- Remover políticas de companies
DROP POLICY IF EXISTS companies_select_own ON companies;
DROP POLICY IF EXISTS companies_insert_own ON companies;
DROP POLICY IF EXISTS companies_update_own ON companies;
DROP POLICY IF EXISTS companies_delete_own ON companies;
DROP POLICY IF EXISTS companies_insert_admin ON companies;
DROP POLICY IF EXISTS companies_delete_admin ON companies;

-- Remover políticas de profiles
DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS profiles_delete_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_admin ON profiles;
DROP POLICY IF EXISTS profiles_delete_admin ON profiles;
DROP POLICY IF EXISTS profiles_update_admin ON profiles;

-- Remover políticas de sessions
DROP POLICY IF EXISTS "Enable all access for sessions" ON sessions;
DROP POLICY IF EXISTS sessions_select_own ON sessions;
DROP POLICY IF EXISTS sessions_insert_own ON sessions;
DROP POLICY IF EXISTS sessions_delete_own ON sessions;

-- Remover políticas de clients
DROP POLICY IF EXISTS clients_select_own ON clients;
DROP POLICY IF EXISTS clients_insert_own ON clients;
DROP POLICY IF EXISTS clients_update_own ON clients;
DROP POLICY IF EXISTS clients_delete_own ON clients;
DROP POLICY IF EXISTS clients_delete_admin ON clients;

-- Remover políticas de invoices
DROP POLICY IF EXISTS invoices_select_own ON invoices;
DROP POLICY IF EXISTS invoices_insert_own ON invoices;
DROP POLICY IF EXISTS invoices_update_own ON invoices;
DROP POLICY IF EXISTS invoices_delete_own ON invoices;
DROP POLICY IF EXISTS invoices_delete_admin ON invoices;

-- Remover políticas de invoice_items
DROP POLICY IF EXISTS invoice_items_select_own ON invoice_items;
DROP POLICY IF EXISTS invoice_items_insert_own ON invoice_items;
DROP POLICY IF EXISTS invoice_items_update_own ON invoice_items;
DROP POLICY IF EXISTS invoice_items_delete_own ON invoice_items;

-- Remover políticas de payments
DROP POLICY IF EXISTS payments_select_own ON payments;
DROP POLICY IF EXISTS payments_insert_own ON payments;
DROP POLICY IF EXISTS payments_update_own ON payments;
DROP POLICY IF EXISTS payments_delete_own ON payments;

-- Remover políticas de certificates
DROP POLICY IF EXISTS certificates_select_own ON certificates;
DROP POLICY IF EXISTS certificates_insert_own ON certificates;
DROP POLICY IF EXISTS certificates_update_own ON certificates;
DROP POLICY IF EXISTS certificates_delete_own ON certificates;

-- Remover políticas de audit_logs
DROP POLICY IF EXISTS audit_logs_select_own ON audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_own ON audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_system ON audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_authenticated ON audit_logs;

-- Remover políticas de import_history
DROP POLICY IF EXISTS import_history_select_own ON import_history;
DROP POLICY IF EXISTS import_history_insert_own ON import_history;

\echo 'Políticas removidas com sucesso!'

\echo '=========================================================================='
\echo 'ETAPA 2/3: Removendo funções helper...'
\echo '=========================================================================='

-- Remover as funções helper criadas
DROP FUNCTION IF EXISTS get_current_user_company_id();
DROP FUNCTION IF EXISTS get_current_user_role();
DROP FUNCTION IF EXISTS is_company_admin();

\echo 'Funções helper removidas com sucesso!'

\echo '=========================================================================='
\echo 'ETAPA 3/3: Garantindo RLS desabilitado em todas as tabelas...'
\echo '=========================================================================='

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

\echo 'RLS desabilitado em todas as tabelas!'

\echo '=========================================================================='
\echo 'REVERSÃO COMPLETA CONCLUÍDA!'
\echo 'Banco de dados limpo e sem políticas RLS'
\echo '=========================================================================='

-- Verificar estado final
\echo 'Verificando estado final:'
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
