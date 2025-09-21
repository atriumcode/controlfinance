-- Temporarily disable email confirmation for easier testing
-- This allows users to be created without email confirmation
-- WARNING: Only use this for development/testing

-- Check current email confirmation settings
SELECT 
  name,
  raw_app_meta_data->>'email_confirm' as email_confirm_required,
  raw_app_meta_data->>'email_confirm_change' as email_confirm_change_required
FROM auth.users 
LIMIT 1;

-- Show current auth settings
SELECT 
  'Current email confirmation setting' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE raw_app_meta_data->>'email_confirm' = 'true'
    ) THEN 'Email confirmation is REQUIRED'
    ELSE 'Email confirmation is DISABLED'
  END as status;

-- For development only: Create a function to manually confirm users
CREATE OR REPLACE FUNCTION manually_confirm_user(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
  WHERE email = user_email 
    AND email_confirmed_at IS NULL;
  
  RAISE NOTICE 'User % has been manually confirmed', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Show all unconfirmed users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'UNCONFIRMED'
    ELSE 'CONFIRMED'
  END as status
FROM auth.users
ORDER BY created_at DESC;
