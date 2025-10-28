-- Limpar autenticação antiga e criar nova estrutura simples
-- Este script cria um sistema de autenticação direto no banco de dados

-- Adicionar campos de autenticação na tabela profiles se não existirem
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

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

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Garantir que a coluna role existe e tem valores corretos
UPDATE profiles SET role = 'admin' WHERE role IS NULL OR role = '';

COMMENT ON TABLE user_sessions IS 'Armazena sessões de usuários autenticados';
COMMENT ON COLUMN profiles.password_hash IS 'Hash bcrypt da senha do usuário';
COMMENT ON COLUMN profiles.is_active IS 'Indica se o usuário está ativo no sistema';
