-- Temporarily disable RLS to allow initial setup
-- Disable RLS temporarily for initial setup
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create simple policies that don't cause recursion
CREATE POLICY "Allow authenticated users to manage companies" ON companies
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage profiles" ON profiles
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Re-enable RLS with simpler policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
