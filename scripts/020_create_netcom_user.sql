-- Criar empresa NETCOM
INSERT INTO companies (
  id,
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
) VALUES (
  gen_random_uuid(),
  'NETCOM',
  '13088522000139',
  'contato@netcom.com.br',
  '',
  '',
  '',
  '',
  '',
  NOW(),
  NOW()
) ON CONFLICT (cnpj) DO NOTHING;

-- Buscar o ID da empresa NETCOM para usar na criação do perfil
DO $$
DECLARE
  company_uuid UUID;
  user_uuid UUID;
BEGIN
  -- Buscar o ID da empresa NETCOM
  SELECT id INTO company_uuid FROM companies WHERE cnpj = '13088522000139';
  
  -- Gerar UUID para o usuário
  user_uuid := gen_random_uuid();
  
  -- Criar usuário no auth.users (simulando o que o Supabase Auth faria)
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    user_uuid,
    'servicos@copycenter.net.br',
    crypt('gehmni', gen_salt('bf')), -- Hash da senha usando bcrypt
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Copycenter"}',
    false,
    'authenticated'
  ) ON CONFLICT (email) DO NOTHING;
  
  -- Criar perfil do usuário
  INSERT INTO profiles (
    id,
    email,
    full_name,
    company_id,
    role,
    created_at,
    updated_at
  ) VALUES (
    user_uuid,
    'servicos@copycenter.net.br',
    'Copycenter',
    company_uuid,
    'admin',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Usuário Copycenter criado com sucesso para a empresa NETCOM';
END $$;
