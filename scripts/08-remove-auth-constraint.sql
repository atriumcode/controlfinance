-- Remove a constraint de chave estrangeira que liga profiles.id ao auth.users
-- Isso permite usar a tabela profiles para autenticação customizada

-- Remove a constraint se existir
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Remove a constraint user_id também se existir
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Garante que o id tem valor padrão
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Torna user_id opcional (pode ser null)
ALTER TABLE profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Adiciona um índice único no email para performance
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles(email);
