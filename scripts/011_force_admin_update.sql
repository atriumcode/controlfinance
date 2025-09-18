-- Force update user role to admin
-- This script directly updates the user role without any conditions

-- First, let's see the current state
SELECT 'Current user data:' as info;
SELECT id, email, full_name, role, company_id, created_at 
FROM profiles 
WHERE email = 'copycenter_bdo@hotmail.com';

-- Force update the role to admin
UPDATE profiles 
SET role = 'admin'
WHERE email = 'copycenter_bdo@hotmail.com';

-- Verify the update
SELECT 'Updated user data:' as info;
SELECT id, email, full_name, role, company_id, created_at 
FROM profiles 
WHERE email = 'copycenter_bdo@hotmail.com';

-- Also update any auth.users metadata if needed
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'copycenter_bdo@hotmail.com';

SELECT 'Script completed successfully' as result;
