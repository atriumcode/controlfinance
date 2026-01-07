-- Fix the user registration trigger to properly handle company creation
-- This addresses the mismatch between what the registration form sends and what the trigger expects

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a robust function that handles both new and existing companies
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
  
  -- If no existing company found, create a new one
  IF company_uuid IS NULL THEN
    INSERT INTO public.companies (name, cnpj, email, phone, address, city, state, zip_code)
    VALUES (
      COALESCE(user_company_name, 'Minha Empresa'),
      COALESCE(user_cnpj, ''),
      NEW.email, -- Use user's email as company email initially
      '',
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO company_uuid;
  END IF;
  
  -- Create user profile linked to the company
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
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'administrador', -- First user of a company should be admin
    company_uuid,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    company_id = EXCLUDED.company_id,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the fix by showing current trigger status
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Show any existing users without profiles (these would need manual fixing)
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_exists
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
