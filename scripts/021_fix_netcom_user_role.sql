-- Corrigir o role do usuário Copycenter da empresa NETCOM
-- O sistema usa roles em português: 'administrador', 'escrita', 'leitura'

UPDATE profiles 
SET role = 'administrador',
    updated_at = NOW()
WHERE email = 'servicos@copycenter.net.br' 
  AND role = 'admin';

-- Verificar se a atualização foi bem-sucedida
DO $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM profiles 
  WHERE email = 'servicos@copycenter.net.br';
  
  IF user_role = 'administrador' THEN
    RAISE NOTICE 'Role do usuário Copycenter atualizado com sucesso para: %', user_role;
  ELSE
    RAISE NOTICE 'Atenção: Role atual do usuário é: %', user_role;
  END IF;
END $$;
