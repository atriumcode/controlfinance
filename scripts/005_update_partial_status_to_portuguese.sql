-- Update partial status to Portuguese
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
  CHECK (status IN ('pending', 'Parcial', 'paid', 'overdue', 'cancelled'));

-- Update existing records with partial status
UPDATE invoices SET status = 'Parcial' WHERE status = 'partial';
