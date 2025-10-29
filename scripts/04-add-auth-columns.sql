-- Adiciona colunas necessárias para autenticação

-- Adicionar coluna token na tabela sessions
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text;

-- Adicionar colunas de autenticação na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Criar índice para melhorar performance de login
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);

-- Garantir que email seja único
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);
