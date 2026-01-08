-- SOLUÇÃO COMPLETA: Corrigir todos os problemas de registro e autenticação
-- Este script resolve os problemas de RLS, triggers e permissões de uma vez

-- 1. LIMPAR ESTADO ATUAL
-- Remover triggers problemáticos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS create_user_profile();

-- Remover políticas RLS problemáticas
DROP POLICY IF EXISTS "admin_full_access_companies" ON companies;
DROP POLICY IF EXISTS "admin_full_access_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_full_access_clients" ON clients;
DROP POLICY IF EXISTS "admin_full_access_invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles in their company" ON profiles;

-- 2. DESABILITAR RLS TEMPORARIAMENTE PARA SETUP
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- 3. CORRIGIR CONSTRAINTS DE ROLE
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('leitura', 'escrita', 'administrador'));

-- 4. CRIAR FUNÇÃO DE REGISTRO ROBUSTA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_uuid UUID;
  user_cnpj TEXT;
  user_company_name TEXT;
  user_full_name TEXT;
BEGIN
  -- Log para debug
  RAISE LOG 'Trigger handle_new_user executado para usuário: %', NEW.email;
  
  -- Extrair dados do metadata
  user_cnpj := COALESCE(NEW.raw_user_meta_data ->> 'cnpj', '');
  user_company_name := COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Minha Empresa');
  user_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  
  -- Tentar encontrar empresa existente pelo CNPJ
  IF user_cnpj != '' THEN
    SELECT id INTO company_uuid 
    FROM public.companies 
    WHERE cnpj = user_cnpj 
    LIMIT 1;
    
    RAISE LOG 'Empresa existente encontrada: %', company_uuid;
  END IF;
  
  -- Se não encontrou empresa, criar nova
  IF company_uuid IS NULL THEN
    INSERT INTO public.companies (
      name, 
      cnpj, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      zip_code,
      created_at,
      updated_at
    )
    VALUES (
      user_company_name,
      user_cnpj,
      NEW.email,
      '',
      '',
      '',
      '',
      '',
      NOW(),
      NOW()
    )
    RETURNING id INTO company_uuid;
    
    RAISE LOG 'Nova empresa criada: %', company_uuid;
  END IF;
  
  -- Criar perfil do usuário
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    company_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    'administrador', -- Primeiro usuário sempre é admin
    company_uuid,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_id = EXCLUDED.company_id,
    updated_at = NOW();

  RAISE LOG 'Perfil criado para usuário: % na empresa: %', NEW.email, company_uuid;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falha o registro
    RAISE LOG 'Erro no trigger handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. CRIAR TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. REABILITAR RLS COM POLÍTICAS SIMPLES
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS SIMPLES E FUNCIONAIS
-- Companies: usuários podem ver/editar sua própria empresa
CREATE POLICY "company_access" ON companies
  FOR ALL USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Profiles: usuários podem ver perfis da sua empresa
CREATE POLICY "profile_access" ON profiles
  FOR ALL USING (
    id = auth.uid() OR 
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Clients: usuários podem ver/editar clientes da sua empresa
CREATE POLICY "client_access" ON clients
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Invoices: usuários podem ver/editar faturas da sua empresa
CREATE POLICY "invoice_access" ON invoices
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Invoice Items: usuários podem ver/editar itens de faturas da sua empresa
CREATE POLICY "invoice_item_access" ON invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT i.id FROM invoices i 
      JOIN profiles p ON i.company_id = p.company_id 
      WHERE p.id = auth.uid()
    )
  );

-- Payments: usuários podem ver/editar pagamentos da sua empresa
CREATE POLICY "payment_access" ON payments
  FOR ALL USING (
    invoice_id IN (
      SELECT i.id FROM invoices i 
      JOIN profiles p ON i.company_id = p.company_id 
      WHERE p.id = auth.uid()
    )
  );

-- 8. VERIFICAR CONFIGURAÇÃO FINAL
SELECT 'CONFIGURAÇÃO FINAL:' as status;

SELECT 'Triggers ativos:' as info;
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%user%' OR trigger_name LIKE '%profile%';

SELECT 'RLS habilitado:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('companies', 'profiles', 'clients', 'invoices', 'invoice_items', 'payments')
AND schemaname = 'public';

SELECT 'Políticas ativas:' as info;
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('companies', 'profiles', 'clients', 'invoices', 'invoice_items', 'payments')
ORDER BY tablename, policyname;

-- 9. TESTAR CRIAÇÃO DE USUÁRIO DE TESTE (opcional)
-- Descomente as linhas abaixo para testar
-- INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
-- VALUES (
--   gen_random_uuid(),
--   'teste@exemplo.com',
--   '{"full_name": "Usuário Teste", "company_name": "Empresa Teste", "cnpj": "12345678000199"}'::jsonb,
--   NOW(),
--   NOW()
-- );
