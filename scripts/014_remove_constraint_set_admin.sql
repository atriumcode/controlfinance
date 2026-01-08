-- Remove a constraint que está bloqueando a atualização
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Atualiza seu usuário para administrador
UPDATE profiles 
SET role = 'administrador'
WHERE email = 'copycenter_bdo@hotmail.com';

-- Verifica se a atualização funcionou
SELECT email, role, full_name, created_at 
FROM profiles 
WHERE email = 'copycenter_bdo@hotmail.com';

-- Recria a constraint com os valores corretos
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('leitura', 'escrita', 'administrador'));

-- Mostra todos os usuários para confirmação
SELECT email, role, full_name FROM profiles ORDER BY created_at;
