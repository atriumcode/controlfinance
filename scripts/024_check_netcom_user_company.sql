-- Verificar se o usuário Copycenter tem company_id associado
SELECT 'Verificando usuário Copycenter:' as status;

-- Verificar se a empresa NETCOM existe
SELECT 'Empresa NETCOM:' as info, id, name, cnpj 
FROM companies 
WHERE cnpj = '13088522000139' OR name ILIKE '%NETCOM%';

-- Verificar se o usuário existe na tabela auth.users
SELECT 'Usuário na tabela auth.users:' as info, id, email, created_at
FROM auth.users 
WHERE email = 'servicos@copycenter.net.br';

-- Verificar se o perfil existe e tem company_id
SELECT 'Perfil do usuário:' as info, p.id, p.email, p.full_name, p.role, p.company_id, c.name as company_name
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.email = 'servicos@copycenter.net.br';

-- Se o usuário não tem company_id, vamos corrigir
DO $$
DECLARE
    user_uuid UUID;
    company_uuid UUID;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'servicos@copycenter.net.br';
    
    -- Buscar o ID da empresa NETCOM
    SELECT id INTO company_uuid 
    FROM companies 
    WHERE cnpj = '13088522000139';
    
    IF user_uuid IS NOT NULL AND company_uuid IS NOT NULL THEN
        -- Atualizar o perfil para associar à empresa
        UPDATE profiles 
        SET company_id = company_uuid,
            updated_at = NOW()
        WHERE id = user_uuid;
        
        RAISE NOTICE 'Usuário % associado à empresa %', user_uuid, company_uuid;
    ELSE
        RAISE NOTICE 'Usuário ou empresa não encontrados. User: %, Company: %', user_uuid, company_uuid;
    END IF;
END $$;

-- Verificar novamente após a correção
SELECT 'Verificação final:' as status;
SELECT p.id, p.email, p.full_name, p.role, p.company_id, c.name as company_name
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.email = 'servicos@copycenter.net.br';
