-- ============================================================================
-- SCRIPT 005: Dados Iniciais (Seed)
-- ============================================================================
-- Descrição: Insere dados iniciais para testes e primeiro acesso
-- Ordem de execução: 5 (OPCIONAL)
-- Dependências: Todas as tabelas e RLS configurados
-- Nota: Este script é OPCIONAL e pode ser executado apenas em desenvolvimento
-- ============================================================================

-- ============================================================================
-- EMPRESA DE TESTE
-- ============================================================================
-- Inserir empresa de exemplo
INSERT INTO companies (id, name, cnpj, email, phone, address, city, state, zip_code)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Empresa Teste LTDA',
  '00.000.000/0001-00',
  'contato@empresateste.com.br',
  '(11) 9999-9999',
  'Rua Teste, 123',
  'São Paulo',
  'SP',
  '01234-567'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- USUÁRIO ADMINISTRADOR DE TESTE
-- ============================================================================
-- Inserir usuário admin (senha: admin123)
-- Hash gerado com bcrypt (rounds=10)
INSERT INTO profiles (
  id,
  company_id,
  full_name,
  email,
  role,
  password_hash,
  is_active
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Administrador',
  'admin@empresateste.com.br',
  'admin',
  '$2b$10$rKvVXJnAqHs3aPZE.RkNyO7mZ0oKQnXWXVEHW.FYj5fWb6qK4vBFu',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CLIENTE DE TESTE
-- ============================================================================
INSERT INTO clients (
  id,
  company_id,
  name,
  document,
  document_type,
  email,
  phone,
  address,
  city,
  state,
  zip_code
)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Cliente Teste',
  '000.000.000-00',
  'cpf',
  'cliente@teste.com.br',
  '(11) 8888-8888',
  'Rua Cliente, 456',
  'São Paulo',
  'SP',
  '01234-567'
)
ON CONFLICT (company_id, document) DO NOTHING;

-- ============================================================================
-- NOTA FISCAL DE TESTE
-- ============================================================================
INSERT INTO invoices (
  id,
  company_id,
  client_id,
  invoice_number,
  issue_date,
  due_date,
  total_amount,
  tax_amount,
  discount_amount,
  net_amount,
  status
)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'NF-001',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  1000.00,
  100.00,
  0.00,
  1100.00,
  'pending'
)
ON CONFLICT (company_id, invoice_number) DO NOTHING;

-- ============================================================================
-- ITEM DA NOTA FISCAL DE TESTE
-- ============================================================================
INSERT INTO invoice_items (
  invoice_id,
  description,
  quantity,
  unit_price,
  total_price,
  tax_rate
)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Produto de Teste',
  10,
  100.00,
  1000.00,
  10.00
);

-- ============================================================================
-- MENSAGEM DE SUCESSO
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Dados iniciais inseridos com sucesso!';
  RAISE NOTICE '📧 Email: admin@empresateste.com.br';
  RAISE NOTICE '🔑 Senha: admin123';
END $$;

-- ============================================================================
-- FIM DO SCRIPT 005
-- ============================================================================
