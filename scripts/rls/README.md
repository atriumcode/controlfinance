# Correção de Políticas RLS (Row Level Security)

Este diretório contém scripts para corrigir o problema de recursão infinita nas políticas RLS.

## Problema Original

As políticas RLS antigas tinham recursão infinita:

\`\`\`sql
-- ERRADO: Causa recursão infinita
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    -- ↑ Acessa profiles dentro da política de profiles = LOOP INFINITO
  );
\`\`\`

## Solução Implementada

Criamos funções helper `SECURITY DEFINER` que não disparam políticas RLS:

\`\`\`sql
-- CORRETO: Sem recursão
CREATE FUNCTION auth.get_user_company_id() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER 
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Agora pode usar sem recursão
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (company_id = auth.get_user_company_id());
\`\`\`

## Como Aplicar

### Opção 1: Aplicar tudo de uma vez

\`\`\`bash
cd /home/expert/projetos/invoice-system/scripts/rls
docker exec -i supabase-db psql -U postgres -d postgres < apply_all_rls_fixes.sql
\`\`\`

### Opção 2: Aplicar passo a passo

\`\`\`bash
# 1. Criar funções helper
docker exec -i supabase-db psql -U postgres -d postgres < 001_create_helper_functions.sql

# 2. Remover políticas antigas
docker exec -i supabase-db psql -U postgres -d postgres < 002_drop_old_policies.sql

# 3. Criar políticas novas
docker exec -i supabase-db psql -U postgres -d postgres < 003_create_new_policies.sql
\`\`\`

## Verificação

Após aplicar, verifique se RLS está ativo:

\`\`\`bash
docker exec supabase-db psql -U postgres -d postgres -c "\d+ profiles"
\`\`\`

Deve mostrar:
- `RLS Enabled: true`
- Políticas ativas sem recursão

## Testar

1. Acesse http://172.16.5.42:3000
2. Faça login
3. Tente configurar empresa
4. Não deve mais ter erro "infinite recursion detected"

## Segurança

As políticas garantem:
- Usuários veem apenas dados da própria empresa
- Admins e managers podem editar dados da empresa
- Apenas admins podem deletar recursos
- Sessions tem acesso livre (necessário para autenticação)
- Audit logs podem ser inseridos pelo sistema
