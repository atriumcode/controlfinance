-- Add support for partial payments
-- Add amount_paid column to track how much has been paid
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(15,2) DEFAULT 0;

-- Add partial status to the status enum
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
  CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled'));

-- Create payments table to track payment history
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view invoice payments" ON payments
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert invoice payments" ON payments
  FOR INSERT WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Update existing invoices to set amount_paid based on status
UPDATE invoices 
SET amount_paid = CASE 
  WHEN status = 'paid' THEN total_amount 
  ELSE 0 
END
WHERE amount_paid IS NULL OR amount_paid = 0;
