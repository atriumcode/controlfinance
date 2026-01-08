-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view company profiles" ON profiles;

-- Add missing INSERT policies for initial setup
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert companies" ON companies
  FOR INSERT WITH CHECK (true);

-- Recreate policies with better logic to avoid recursion
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.company_id = companies.id AND profiles.id = auth.uid())
  );

CREATE POLICY "Users can update their own company" ON companies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.company_id = companies.id AND profiles.id = auth.uid())
  );

-- Profile policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view company profiles" ON profiles
  FOR SELECT USING (
    company_id IN (
      SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
    )
  );
