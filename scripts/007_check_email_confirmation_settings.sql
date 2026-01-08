-- Check if email confirmation is required
-- This query shows the current auth settings
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.config 
      WHERE parameter = 'DISABLE_SIGNUP' AND value = 'false'
    ) THEN 'Signup enabled'
    ELSE 'Signup disabled'
  END as signup_status;

-- Note: Email confirmation settings are managed in Supabase dashboard
-- under Authentication > Settings > Email confirmation
-- For admin user creation, we might need to use the service role key
-- or disable email confirmation temporarily
