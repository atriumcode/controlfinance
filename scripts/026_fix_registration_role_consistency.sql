-- Corrigir inconsistência entre trigger de registro e sistema de roles
-- O trigger cria usuários com 'administrador' mas o sistema espera 'admin'

-- 1. Atualizar constraint da tabela profiles para aceitar 'admin'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('leitura', 'escrita', 'admin'));

-- 2. Atualizar todos os usuários existentes com 'administrador' para 'admin'
UPDATE profiles 
SET role = 'admin', updated_at = NOW()
WHERE role = 'administrador';

-- 3. Recriar a função de trigger para usar 'admin' em vez de 'administrador'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_uuid UUID;
  user_cnpj TEXT;
  user_company_name TEXT;
  user_full_name TEXT;
BEGIN
  -- Log para debug
  RAISE LOG 'Trigger handle_new_user executado para usuário: %', NEW.email;
  
  -- Extrair dados do metadata
  user_cnpj := COALESCE(NEW.raw_user_meta_data ->> 'cnpj', '');
  user_company_name := COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Minha Empresa');
  user_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  
  -- Tentar encontrar empresa existente pelo CNPJ
  IF user_cnpj != '' THEN
    SELECT id INTO company_uuid 
    FROM public.companies 
    WHERE cnpj = user_cnpj 
    LIMIT 1;
    
    RAISE LOG 'Empresa existente encontrada: %', company_uuid;
  END IF;
  
  -- Se não encontrou empresa, criar nova
  IF company_uuid IS NULL THEN
    INSERT INTO public.companies (
      name, 
      cnpj, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      zip_code,
      created_at,
      updated_at
    )
    VALUES (
      user_company_name,
      user_cnpj,
      NEW.email,
      '',
      '',
      '',
      '',
      '',
      NOW(),
      NOW()
    )
    RETURNING id INTO company_uuid;
    
    RAISE LOG 'Nova empresa criada: %', company_uuid;
  END IF;
  
  -- Criar perfil do usuário com role 'admin' (não 'administrador')
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    company_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    'admin', -- Usar 'admin' em vez de 'administrador'
    company_uuid,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_id = EXCLUDED.company_id,
    updated_at = NOW();

  RAISE LOG 'Perfil criado para usuário: % na empresa: % com role: admin', NEW.email, company_uuid;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falha o registro
    RAISE LOG 'Erro no trigger handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Verificar se o trigger existe e recriá-lo se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar configuração final
SELECT 'Verificando usuários com role admin:' as status;
SELECT email, role, full_name, company_id 
FROM profiles 
WHERE role = 'admin';

SELECT 'Constraint da tabela profiles:' as status;
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND conname = 'profiles_role_check';
