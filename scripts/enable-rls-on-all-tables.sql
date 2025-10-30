-- Habilitar RLS em todas as tabelas do sistema
-- Isso corrige o problema de segurança crítico e permite que os JOINs automáticos do Supabase funcionem

-- Habilitar RLS na tabela companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi habilitado corretamente
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'clients', 'invoices', 'payments', 'profiles', 'sessions')
ORDER BY tablename;
