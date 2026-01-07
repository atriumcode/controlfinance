-- Atualizar usuário atual para Administrador
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'copycenter_bdo@hotmail.com';

-- Verificar se a atualização foi bem-sucedida
SELECT id, email, full_name, role, company_id, created_at 
FROM profiles 
WHERE email = 'copycenter_bdo@hotmail.com';
