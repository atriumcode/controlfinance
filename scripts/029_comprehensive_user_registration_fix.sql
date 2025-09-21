-- Comprehensive fix for user registration and role management
-- This script addresses all the issues with user creation, role consistency, and company association

-- First, let's standardize the role system to use English roles consistently
-- Update the profiles table constraint to use English roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'user', 'viewer'));

-- Update existing Portuguese roles to English
UPDATE profiles SET role = 'admin' WHERE role = 'administrador';
UPDATE profiles SET role = 'user' WHERE role = 'usuario';
UPDATE profiles SET role = 'viewer' WHERE role = 'leitura';

-- Drop and recreate the trigger function with proper logic
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_uuid UUID;
  user_cnpj TEXT;
  user_company_name TEXT;
  is_first_user BOOLEAN := FALSE;
BEGIN
  -- Get company data from user metadata
  user_cnpj := NEW.raw_user_meta_data ->> 'cnpj';
  user_company_name := NEW.raw_user_meta_data ->> 'company_name';
  
  -- Try to find existing company by CNPJ
  IF user_cnpj IS NOT NULL AND user_cnpj != '' THEN
    SELECT id INTO company_uuid 
    FROM public.companies 
    WHERE cnpj = user_cnpj 
    LIMIT 1;
  END IF;
  
  -- If no existing company found, create a new one and mark user as first user (admin)
  IF company_uuid IS NULL THEN
    is_first_user := TRUE;
    
    INSERT INTO public.companies (name, cnpj, email, phone, address, city, state, zip_code)
    VALUES (
      COALESCE(user_company_name, 'Minha Empresa'),
      COALESCE(user_cnpj, ''),
      NEW.email,
      '', '', '', '', ''
    )
    RETURNING id INTO company_uuid;
  END IF;
  
  -- Create user profile with appropriate role
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    company_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN is_first_user THEN 'admin' ELSE 'user' END,
    company_uuid,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_id = EXCLUDED.company_id,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix existing users without profiles
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'admin', -- Existing users without profiles become admins
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Update RLS policies to be more permissive for user management
DROP POLICY IF EXISTS "Admins can view all profiles in same company" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles in same company" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view company profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin' 
      AND (admin_profile.company_id = profiles.company_id OR profiles.company_id IS NULL)
    )
  );

CREATE POLICY "Admins can manage company profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin' 
      AND (admin_profile.company_id = profiles.company_id OR profiles.company_id IS NULL)
    )
  );

-- Allow authenticated users to insert their own profiles (for the trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Show results
SELECT 'USERS WITHOUT PROFILES' as status, count(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

SELECT 'TOTAL PROFILES' as status, count(*) as count FROM profiles;
SELECT 'ADMIN USERS' as status, count(*) as count FROM profiles WHERE role = 'admin';
