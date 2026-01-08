-- Adiciona valor padrão para a coluna id sem remover constraints
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Garante que a coluna email seja única
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;
