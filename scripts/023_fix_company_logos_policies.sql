-- Remove políticas existentes do bucket company-logos
DROP POLICY IF EXISTS "Allow authenticated uploads 1y3lpeg_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates 1y3lpeg_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes 1y3lpeg_0" ON storage.objects;

-- Criar políticas corretas para o bucket company-logos
CREATE POLICY "Allow authenticated uploads to company-logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Allow authenticated updates to company-logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos')
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Allow authenticated deletes from company-logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos');

CREATE POLICY "Allow public read access to company-logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-logos');
