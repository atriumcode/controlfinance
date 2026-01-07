-- Verificar status atual das faturas com amount_paid > 0
SELECT id, invoice_number, status, total_amount, amount_paid, 
       (total_amount - COALESCE(amount_paid, 0)) as saldo_restante
FROM invoices 
WHERE amount_paid > 0 AND amount_paid < total_amount;

-- Atualizar status para 'Parcial' onde há pagamento parcial
UPDATE invoices 
SET status = 'Parcial'
WHERE amount_paid > 0 
  AND amount_paid < total_amount 
  AND status != 'paid';

-- Verificar resultado
SELECT id, invoice_number, status, total_amount, amount_paid
FROM invoices 
WHERE amount_paid > 0;
