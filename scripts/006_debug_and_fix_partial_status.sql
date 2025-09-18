-- Debug: Check current status values in database
SELECT DISTINCT status FROM invoices;

-- Update any invoices that might have 'partial' instead of 'Parcial'
UPDATE invoices 
SET status = 'Parcial' 
WHERE status = 'partial';

-- Ensure the enum includes all possible values
ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'Parcial';
