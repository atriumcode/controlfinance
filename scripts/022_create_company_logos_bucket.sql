-- Create a dedicated bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete company logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to company logos" ON storage.objects;

-- Create storage policies for company-logos bucket
CREATE POLICY "Allow authenticated users to upload company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Allow authenticated users to update company logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos');

CREATE POLICY "Allow authenticated users to delete company logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos');

CREATE POLICY "Allow public read access to company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');
