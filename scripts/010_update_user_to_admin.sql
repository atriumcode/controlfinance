-- Atualizar usuário específico para Administrador
-- Este script atualiza o role do usuário copycenter_bdo@hotmail.com para 'admin'

UPDATE profiles 
SET 
    role = 'admin',
    updated_at = NOW()
WHERE email = 'copycenter_bdo@hotmail.com';

-- Verificar se a atualização foi bem-sucedida
SELECT 
    id,
    email,
    full_name,
    role,
    company_id,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'copycenter_bdo@hotmail.com';

-- Mostrar todos os usuários da empresa para verificação
SELECT 
    email,
    full_name,
    role,
    created_at
FROM profiles 
WHERE company_id = (
    SELECT company_id 
    FROM profiles 
    WHERE email = 'copycenter_bdo@hotmail.com'
)
ORDER BY created_at;
