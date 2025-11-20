-- ============================================================================
-- REMOVER POLÍTICAS RLS ANTIGAS (COM RECURSÃO)
-- ============================================================================
-- Descrição: Remove todas as políticas antigas que causam recursão infinita
-- ============================================================================

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE import_history DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas antigas da tabela companies
DROP POLICY IF EXISTS "companies_select_own" ON companies;
DROP POLICY IF EXISTS "companies_insert_own" ON companies;
DROP POLICY IF EXISTS "companies_update_own" ON companies;
DROP POLICY IF EXISTS "companies_delete_own" ON companies;
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert companies" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;

-- Remover todas as políticas antigas da tabela profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Enable all access for profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view company profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in same company" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles in same company" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Remover todas as políticas antigas da tabela sessions
DROP POLICY IF EXISTS "Enable all access for sessions" ON sessions;

-- Remover todas as políticas antigas da tabela clients
DROP POLICY IF EXISTS "clients_select_own" ON clients;
DROP POLICY IF EXISTS "clients_insert_own" ON clients;
DROP POLICY IF EXISTS "clients_update_own" ON clients;
DROP POLICY IF EXISTS "clients_delete_own" ON clients;
DROP POLICY IF EXISTS "Users can insert company clients" ON clients;
DROP POLICY IF EXISTS "Users can update company clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete company clients" ON clients;

-- Remover todas as políticas antigas da tabela invoices
DROP POLICY IF EXISTS "invoices_select_own" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_own" ON invoices;
DROP POLICY IF EXISTS "invoices_update_own" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_own" ON invoices;
DROP POLICY IF EXISTS "Users can insert company invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update company invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can delete company invoices" ON invoices;

-- Remover todas as políticas antigas da tabela invoice_items
DROP POLICY IF EXISTS "invoice_items_select_own" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert_own" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_update_own" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_delete_own" ON invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items" ON invoice_items;

-- Remover todas as políticas antigas da tabela payments
DROP POLICY IF EXISTS "payments_select_own" ON payments;
DROP POLICY IF EXISTS "payments_insert_own" ON payments;
DROP POLICY IF EXISTS "Users can view invoice payments" ON payments;
DROP POLICY IF EXISTS "Users can insert invoice payments" ON payments;

-- Remover todas as políticas antigas da tabela audit_logs
DROP POLICY IF EXISTS "audit_logs_select_own" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_system" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Remover todas as políticas antigas da tabela import_history
DROP POLICY IF EXISTS "import_history_select_own" ON import_history;
DROP POLICY IF EXISTS "import_history_insert_own" ON import_history;
DROP POLICY IF EXISTS "Users can view import history from their company" ON import_history;
DROP POLICY IF EXISTS "Users can insert import history for their company" ON import_history;

-- ============================================================================
-- FIM DA LIMPEZA
-- ============================================================================
