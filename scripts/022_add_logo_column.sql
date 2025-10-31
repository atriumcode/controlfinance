-- Add logo_url column to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- That's it! The storage bucket needs to be created through the Supabase Dashboard.
