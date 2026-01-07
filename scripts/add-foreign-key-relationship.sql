-- Add foreign key relationship between invoices and clients
-- This enables Supabase's automatic JOIN to work correctly

-- First, check if the foreign key already exists and drop it if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'invoices_client_id_fkey'
    ) THEN
        ALTER TABLE invoices DROP CONSTRAINT invoices_client_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraint
-- ON DELETE SET NULL means if a client is deleted, the invoice's client_id becomes null
-- This prevents orphaned invoices
ALTER TABLE invoices
ADD CONSTRAINT invoices_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE SET NULL;

-- Create an index on client_id for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- Verify the relationship was created
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'invoices'
    AND kcu.column_name = 'client_id';
