-- ============================================================================
-- SCRIPT 001: Criar Tabelas Base
-- ============================================================================
-- Descrição: Cria as tabelas principais do sistema (companies, profiles, sessions)
-- Ordem de execução: 1
-- Dependências: Nenhuma
-- ============================================================================

-- Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: companies
-- Descrição: Armazena informações das empresas (multi-tenancy)
-- ============================================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE companies IS 'Empresas cadastradas no sistema (multi-tenancy)';
COMMENT ON COLUMN companies.cnpj IS 'CNPJ da empresa (único no sistema)';
COMMENT ON COLUMN companies.logo_url IS 'URL do logotipo da empresa (Vercel Blob Storage)';

-- ============================================================================
-- TABELA: profiles
-- Descrição: Perfis de usuários do sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
  cnpj TEXT,
  company_name TEXT,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Usuários do sistema com controle de acesso por empresa';
COMMENT ON COLUMN profiles.role IS 'Papel do usuário: admin, manager, user, viewer';
COMMENT ON COLUMN profiles.company_id IS 'Empresa à qual o usuário pertence';
COMMENT ON COLUMN profiles.is_active IS 'Status do usuário (ativo/inativo)';

-- ============================================================================
-- TABELA: sessions
-- Descrição: Sessões de autenticação dos usuários
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE sessions IS 'Sessões ativas de usuários autenticados';
COMMENT ON COLUMN sessions.token IS 'Token único de sessão';
COMMENT ON COLUMN sessions.expires_at IS 'Data/hora de expiração da sessão';

-- ============================================================================
-- ÍNDICES para melhor performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIM DO SCRIPT 001
-- ============================================================================
