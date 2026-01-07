-- Verificar permissões do usuário Copycenter
SELECT 
    p.email,
    p.name,
    p.role,
    c.name as company_name,
    c.cnpj
FROM profiles p
JOIN companies c ON p.company_id = c.id
WHERE p.email = 'servicos@copycenter.net.br';

-- Verificar se o usuário tem permissão para inserir pagamentos
-- Simular a verificação que o RLS faz
SELECT 
    'User can insert payments' as check_result,
    CASE 
        WHEN p.role IN ('admin', 'escrita') THEN 'YES - User has required role'
        ELSE 'NO - User role is: ' || p.role
    END as permission_status
FROM profiles p
WHERE p.email = 'servicos@copycenter.net.br';

-- Verificar políticas RLS ativas na tabela payments
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'payments'
ORDER BY policyname;
