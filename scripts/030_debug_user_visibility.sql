-- Debug script to check user visibility issues
-- Check all users in auth.users
SELECT 'AUTH USERS:' as section;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Check all profiles
SELECT 'PROFILES:' as section;
SELECT id, email, full_name, role, company_id, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- Check companies
SELECT 'COMPANIES:' as section;
SELECT id, name, created_at 
FROM companies 
ORDER BY created_at DESC;

-- Check for orphaned auth users (users without profiles)
SELECT 'ORPHANED AUTH USERS:' as section;
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Check RLS policies on profiles table
SELECT 'PROFILES RLS POLICIES:' as section;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';
