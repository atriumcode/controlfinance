-- Atualizar usuário para administrador usando valores em português
UPDATE profiles 
SET 
  role = 'administrador',
  updated_at = NOW()
WHERE email = 'copycenter_bdo@hotmail.com';

-- Verificar a atualização
SELECT 
  id,
  email,
  full_name,
  role,
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
