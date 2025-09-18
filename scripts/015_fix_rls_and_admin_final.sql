-- SOLUÇÃO DEFINITIVA: Reabilitar RLS com políticas simples e definir admin

-- 1. Primeiro, remover a constraint problemática e definir você como admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Atualizar seu usuário para administrador
UPDATE profiles 
SET role = 'administrador'
WHERE email = 'copycenter_bdo@hotmail.com';

-- 3. Recriar a constraint com valores corretos
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('leitura', 'escrita', 'administrador'));

-- 4. Reabilitar RLS nas tabelas principais
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas simples que funcionam para administradores
-- Políticas para companies (administradores têm acesso total)
CREATE POLICY "admin_full_access_companies" ON companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrador')
  );

-- Políticas para profiles (administradores podem ver todos os perfis da empresa)
CREATE POLICY "admin_full_access_profiles" ON profiles
  FOR ALL USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrador')
  );

-- Políticas para clients (administradores têm acesso total)
CREATE POLICY "admin_full_access_clients" ON clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrador')
  );

-- Políticas para invoices (administradores têm acesso total)
CREATE POLICY "admin_full_access_invoices" ON invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrador')
  );

-- 6. Verificar se tudo funcionou
SELECT 'USUÁRIO ATUALIZADO:' as status;
SELECT email, role, full_name, created_at 
FROM profiles 
WHERE email = 'copycenter_bdo@hotmail.com';

SELECT 'RLS HABILITADO NAS TABELAS:' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('companies', 'profiles', 'clients', 'invoices')
AND schemaname = 'public';

SELECT 'POLÍTICAS CRIADAS:' as status;
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('companies', 'profiles', 'clients', 'invoices')
ORDER BY tablename, policyname;
