-- ============================================================================
-- FUNÇÕES HELPER PARA RLS SEM RECURSÃO
-- ============================================================================
-- Descrição: Cria funções que retornam company_id e role sem causar recursão
-- ============================================================================

-- Função para obter company_id do usuário atual
-- SECURITY DEFINER permite que a função rode com privilégios do owner
-- Isso evita recursão porque não dispara políticas RLS
CREATE OR REPLACE FUNCTION auth.get_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Função para verificar se usuário é admin ou manager
CREATE OR REPLACE FUNCTION auth.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role IN ('admin', 'manager')
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role = 'admin'
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- ============================================================================
-- FIM DAS FUNÇÕES HELPER
-- ============================================================================
