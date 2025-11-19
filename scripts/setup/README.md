# Scripts de Setup do Banco de Dados

Este diretório contém scripts SQL completos e ordenados para configurar o banco de dados PostgreSQL/Supabase do zero.

## 📋 Ordem de Execução

Execute os scripts **na ordem numérica**:

### 1️⃣ `001_create_base_tables.sql`
**Descrição:** Cria as tabelas base do sistema
- Tabela `companies` (empresas)
- Tabela `profiles` (usuários)
- Tabela `sessions` (sessões de autenticação)
- Função trigger para `updated_at`
- Índices de performance

**Dependências:** Nenhuma

---

### 2️⃣ `002_create_business_tables.sql`
**Descrição:** Cria as tabelas de negócio
- Tabela `clients` (clientes)
- Tabela `invoices` (notas fiscais)
- Tabela `invoice_items` (itens das notas)
- Tabela `payments` (pagamentos)
- Índices e triggers

**Dependências:** Script 001

---

### 3️⃣ `003_create_support_tables.sql`
**Descrição:** Cria tabelas de suporte e auditoria
- Tabela `audit_logs` (auditoria)
- Tabela `certificates` (certidões)
- Tabela `import_history` (histórico de importações)
- Views `valid_certificates` e `expired_certificates`
- Índices

**Dependências:** Scripts 001 e 002

---

### 4️⃣ `004_configure_rls.sql`
**Descrição:** Configura Row Level Security (RLS)
- Habilita RLS em todas as tabelas
- Cria políticas de segurança
- Controle de acesso por empresa (multi-tenancy)
- Permissões por role (admin, manager, user, viewer)

**Dependências:** Scripts 001, 002 e 003

---

### 5️⃣ `005_seed_initial_data.sql` *(OPCIONAL)*
**Descrição:** Insere dados iniciais para testes
- Empresa de teste
- Usuário admin (email: `admin@empresateste.com.br`, senha: `admin123`)
- Cliente de teste
- Nota fiscal de exemplo

**Dependências:** Scripts 001 a 004

⚠️ **ATENÇÃO:** Este script é apenas para ambiente de desenvolvimento/testes!

---

## 🚀 Como Executar

### Opção 1: Via psql (linha de comando)

\`\`\`bash
# Conectar ao banco
psql -h localhost -U postgres -d seu_banco

# Executar scripts em ordem
\i scripts/setup/001_create_base_tables.sql
\i scripts/setup/002_create_business_tables.sql
\i scripts/setup/003_create_support_tables.sql
\i scripts/setup/004_configure_rls.sql
\i scripts/setup/005_seed_initial_data.sql
\`\`\`

### Opção 2: Via Supabase Dashboard

1. Acesse o Supabase Dashboard local: http://localhost:54323
2. Vá em **SQL Editor**
3. Cole o conteúdo de cada script
4. Execute em ordem (001 → 002 → 003 → 004 → 005)

### Opção 3: Script único (concatenar todos)

\`\`\`bash
# Criar script único
cat scripts/setup/001_create_base_tables.sql \
    scripts/setup/002_create_business_tables.sql \
    scripts/setup/003_create_support_tables.sql \
    scripts/setup/004_configure_rls.sql \
    scripts/setup/005_seed_initial_data.sql > setup_complete.sql

# Executar
psql -h localhost -U postgres -d seu_banco -f setup_complete.sql
\`\`\`

---

## 🗂️ Estrutura do Banco de Dados

### Tabelas Principais

- **companies** - Empresas (multi-tenancy)
- **profiles** - Usuários do sistema
- **sessions** - Sessões de autenticação
- **clients** - Clientes das empresas
- **invoices** - Notas fiscais
- **invoice_items** - Itens das notas fiscais
- **payments** - Pagamentos (suporta pagamento parcial)
- **certificates** - Certidões e documentos
- **import_history** - Histórico de importações XML/OFX
- **audit_logs** - Logs de auditoria

### Views

- **valid_certificates** - Certidões vigentes (não vencidas)
- **expired_certificates** - Certidões vencidas

### Roles de Usuários

- `admin` - Acesso total (CRUD completo)
- `manager` - Gerência (leitura, criação, edição)
- `user` - Usuário padrão (leitura, criação limitada)
- `viewer` - Apenas visualização

---

## ✅ Verificação

Após executar os scripts, verifique:

\`\`\`sql
-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Contar políticas RLS
SELECT schemaname, tablename, COUNT(*) as policies
FROM pg_policies
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Testar login com usuário de teste (se executou script 005)
SELECT id, email, role, is_active 
FROM profiles 
WHERE email = 'admin@empresateste.com.br';
\`\`\`

---

## 🔒 Segurança

- ✅ Row Level Security (RLS) habilitado em todas as tabelas sensíveis
- ✅ Políticas de acesso por empresa (multi-tenancy)
- ✅ Controle de permissões por role
- ✅ Senhas armazenadas com hash bcrypt
- ✅ Auditoria completa de operações
- ✅ Chaves estrangeiras com ON DELETE CASCADE/SET NULL
- ✅ Constraints de integridade

---

## 📝 Notas Importantes

1. **Multi-tenancy:** Todas as tabelas são isoladas por `company_id`
2. **Passwords:** Armazenados com bcrypt (não use MD5 ou SHA)
3. **UUIDs:** Todas as PKs usam UUID para segurança
4. **Timestamps:** Todas as tabelas têm `created_at` e `updated_at`
5. **Soft Delete:** Considere adicionar `deleted_at` se necessário
6. **Backup:** Sempre faça backup antes de executar scripts em produção

---

## 🐛 Troubleshooting

**Erro: "extension uuid-ossp does not exist"**
\`\`\`sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\`\`\`

**Erro: "auth.uid() does not exist"**
- Supabase usa `auth.uid()` para obter o ID do usuário autenticado
- Em PostgreSQL puro, você precisará adaptar as políticas RLS

**Erro: "permission denied"**
\`\`\`sql
-- Garantir permissões
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
\`\`\`

---

## 📧 Suporte

Criado para o sistema de gerenciamento de notas fiscais.
Compatível com Supabase local (Ubuntu) e PostgreSQL 14+.
