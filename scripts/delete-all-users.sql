-- ATENÇÃO: Este script deleta TODOS os usuários do sistema
-- Use com cuidado! Esta ação não pode ser desfeita.

-- Deletar todos os perfis
DELETE FROM profiles;

-- Deletar todos os usuários do Supabase Auth
-- NOTA: Este comando precisa ser executado no painel do Supabase
-- ou via API com a service role key, pois a tabela auth.users
-- não é acessível diretamente via SQL normal.

-- Para deletar usuários via SQL, você precisa usar a função do Supabase:
-- Vá para: Supabase Dashboard > Authentication > Users
-- E delete manualmente os usuários, OU use o script Node.js fornecido.
