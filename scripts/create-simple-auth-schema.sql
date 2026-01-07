-- Create a simple authentication system without email confirmation
-- This will modify the existing profiles table to work with simple auth

-- First, let's update the profiles table to include password hash and remove dependency on Supabase auth
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add password hash column for simple authentication
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Make email unique
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Update the role column to have default values
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

-- Add check constraint for valid roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'manager', 'user', 'accountant'));

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_company_role_idx ON profiles (company_id, role);

-- Insert a default admin user (password will be 'admin123' - hash will be generated in the app)
INSERT INTO profiles (id, email, full_name, role, password_hash, company_id, is_active)
VALUES (
  gen_random_uuid(),
  'admin@invoice.com',
  'System Administrator',
  'admin',
  '$2b$10$rQZ8qVZ8qVZ8qVZ8qVZ8qOqVZ8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8', -- placeholder hash
  (SELECT id FROM companies LIMIT 1), -- assign to first company
  true
) ON CONFLICT (email) DO NOTHING;

-- Create sessions table for managing user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session token for fast lookups
CREATE INDEX IF NOT EXISTS user_sessions_token_idx ON user_sessions (session_token);
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS user_sessions_expires_idx ON user_sessions (expires_at);

-- Clean up expired sessions function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
