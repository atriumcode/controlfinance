-- Verificar quais invoices têm client_id mas o cliente não existe
SELECT 
  i.id as invoice_id,
  i.invoice_number,
  i.client_id,
  c.id as client_exists
FROM invoices i
LEFT JOIN clients c ON i.client_id = c.id
WHERE i.client_id IS NOT NULL
  AND c.id IS NULL;

-- Isso mostrará todas as invoices que têm client_id mas o cliente não existe no banco
