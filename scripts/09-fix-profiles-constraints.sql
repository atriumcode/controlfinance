-- Remove foreign key constraint from profiles.id if it exists
DO $$ 
BEGIN
    -- Drop the foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
    
    -- Drop the user_id foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_fkey;
    END IF;
END $$;

-- Make sure id column has a default value
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Make user_id nullable since we're not using Supabase Auth
ALTER TABLE profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment
COMMENT ON TABLE profiles IS 'User profiles with custom authentication';
