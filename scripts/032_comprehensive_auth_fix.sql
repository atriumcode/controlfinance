-- Comprehensive fix for authentication and user registration issues

-- First, let's check the current state
SELECT 'Current auth users:' as info;
SELECT id, email, email_confirmed_at, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

SELECT 'Current profiles:' as info;
SELECT id, email, full_name, role, company_id, created_at FROM profiles ORDER BY created_at DESC LIMIT 10;

-- Fix any orphaned auth users without profiles
INSERT INTO profiles (id, email, full_name, role, company_id, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
  'admin' as role, -- First user becomes admin
  (SELECT id FROM companies ORDER BY created_at LIMIT 1) as company_id,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email_confirmed_at IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Update any profiles without company_id
UPDATE profiles 
SET company_id = (SELECT id FROM companies ORDER BY created_at LIMIT 1)
WHERE company_id IS NULL;

-- Ensure RLS is properly enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.id = auth.uid() 
      AND p2.company_id = profiles.company_id
      AND p2.role = 'admin'
    )
  );

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.id = auth.uid() 
      AND p2.role = 'admin'
    )
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.id = auth.uid() 
      AND p2.company_id = profiles.company_id
      AND p2.role = 'admin'
    )
  );

CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.id = auth.uid() 
      AND p2.company_id = profiles.company_id
      AND p2.role = 'admin'
    )
  );

-- Create or replace the profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
BEGIN
  -- Only create profile if user is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, company_id, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      CASE 
        WHEN (SELECT COUNT(*) FROM profiles) = 0 THEN 'admin'
        ELSE 'user'
      END,
      COALESCE(
        (NEW.raw_user_meta_data->>'company_id')::uuid,
        (SELECT id FROM companies ORDER BY created_at LIMIT 1)
      ),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Trigger for when user is created (handles immediate confirmation)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for when user confirms email
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Final check
SELECT 'Final state check:' as info;
SELECT 
  au.email,
  au.email_confirmed_at IS NOT NULL as confirmed,
  p.full_name,
  p.role,
  c.name as company_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN companies c ON p.company_id = c.id
ORDER BY au.created_at DESC;
