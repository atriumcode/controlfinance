-- Script completo para criar sistema de autenticação do zero
-- Este script pode ser executado mesmo em um banco vazio

-- Criar tabela de profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  company_name TEXT,
  cnpj TEXT,
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de sessões
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at na tabela profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Criar usuário admin padrão (senha: admin123)
-- Hash bcrypt de 'admin123': $2b$10$rBV2kHf7gu8qvXqhgeHOHOqP7V5nFJxH0JJmEZvLkYxPqGxKp5zKe
INSERT INTO profiles (email, full_name, role, password_hash, is_active)
VALUES (
  'admin@sistema.com',
  'Administrador',
  'admin',
  '$2b$10$rBV2kHf7gu8qvXqhgeHOHOqP7V5nFJxH0JJmEZvLkYxPqGxKp5zKe',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE profiles IS 'Tabela de usuários do sistema com autenticação própria';
COMMENT ON TABLE user_sessions IS 'Armazena sessões de usuários autenticados';
COMMENT ON COLUMN profiles.password_hash IS 'Hash bcrypt da senha do usuário';
COMMENT ON COLUMN profiles.is_active IS 'Indica se o usuário está ativo no sistema';
COMMENT ON COLUMN profiles.role IS 'Papel do usuário: admin, contador, ou user';
