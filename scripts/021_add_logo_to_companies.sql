-- Add logo_url column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create storage bucket for company logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public bucket
CREATE POLICY "Public bucket is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload to public bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'public' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'public' AND auth.role() = 'authenticated');
