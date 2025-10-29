-- Remove a constraint de chave estrangeira da coluna id da tabela profiles
-- Isso permite usar autenticação customizada sem depender do auth.users do Supabase

DO $$ 
BEGIN
    -- Remove a constraint profiles_id_fkey se ela existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
        RAISE NOTICE 'Constraint profiles_id_fkey removida com sucesso';
    ELSE
        RAISE NOTICE 'Constraint profiles_id_fkey não existe';
    END IF;
END $$;

-- Garante que a coluna id tem um valor padrão
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Garante que is_active tem um valor padrão
ALTER TABLE profiles 
ALTER COLUMN is_active SET DEFAULT true;
