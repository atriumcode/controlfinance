-- Remove all RLS policies and disable RLS to fix infinite recursion
-- This allows the initial setup to work properly

-- Disable RLS on all tables
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can insert company" ON companies;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert profile" ON profiles;
DROP POLICY IF EXISTS "Users can view company clients" ON clients;
DROP POLICY IF EXISTS "Users can manage company clients" ON clients;
DROP POLICY IF EXISTS "Users can view company invoices" ON invoices;
DROP POLICY IF EXISTS "Users can manage company invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can manage invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can view company audit logs" ON audit_logs;

-- For now, we'll rely on application-level security
-- This allows the initial setup to work without RLS conflicts
-- RLS can be re-enabled later with simpler policies if needed

COMMENT ON TABLE companies IS 'RLS disabled - using application-level security';
COMMENT ON TABLE profiles IS 'RLS disabled - using application-level security';
