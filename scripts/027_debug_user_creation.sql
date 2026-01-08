-- Check if users were created in auth.users and profiles table
SELECT 'AUTH USERS' as table_name, email, created_at, email_confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'PROFILES' as table_name, email, full_name, role, company_id, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if the trigger function exists and is working
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check if the trigger is attached to auth.users
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
