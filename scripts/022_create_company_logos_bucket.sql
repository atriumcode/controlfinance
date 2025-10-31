-- Add logo_url column to companies table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE companies ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- Create a dedicated bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Company logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete company logos" ON storage.objects;

-- Create storage policies for company-logos bucket
-- Policy 1: Allow public read access
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- Policy 2: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'company-logos' 
    AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update company logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'company-logos' 
    AND auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'company-logos' 
    AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete company logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'company-logos' 
    AND auth.role() = 'authenticated'
);
