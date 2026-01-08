-- Primeiro, vamos verificar quais valores são permitidos na constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'profiles_role_check';

-- Vamos ver os valores únicos existentes na coluna role
SELECT DISTINCT role, COUNT(*) as count
FROM profiles 
GROUP BY role;

-- Vamos ver especificamente seu usuário atual
SELECT id, email, role, full_name 
FROM profiles 
WHERE email = 'copycenter_bdo@hotmail.com';

-- Agora vamos tentar atualizar com diferentes valores possíveis
-- Primeiro tentativa: 'admin'
UPDATE profiles 
SET role = 'admin'
WHERE email = 'copycenter_bdo@hotmail.com';

-- Se falhar, tentamos 'administrador'
UPDATE profiles 
SET role = 'administrador'
WHERE email = 'copycenter_bdo@hotmail.com';

-- Se falhar, tentamos 'ADMIN'
UPDATE profiles 
SET role = 'ADMIN'
WHERE email = 'copycenter_bdo@hotmail.com';

-- Verificar o resultado final
SELECT id, email, role, full_name 
FROM profiles 
WHERE email = 'copycenter_bdo@hotmail.com';
