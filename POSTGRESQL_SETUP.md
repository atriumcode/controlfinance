# Configuração do Sistema com PostgreSQL Local

Este guia mostra como configurar o sistema de notas fiscais usando PostgreSQL local, **sem necessidade do Supabase**.

## Pré-requisitos

- PostgreSQL 14 ou superior instalado e rodando
- Node.js 18 ou superior
- npm ou yarn

## Passo 1: Configurar PostgreSQL

### 1.1 Instalar PostgreSQL (se ainda não tiver)

**Ubuntu/Debian:**
\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
\`\`\`

**macOS:**
\`\`\`bash
brew install postgresql@16
brew services start postgresql@16
\`\`\`

**Windows:**
Baixe o instalador em: https://www.postgresql.org/download/windows/

### 1.2 Criar Banco de Dados e Usuário

\`\`\`bash
# Acessar PostgreSQL como superusuário
sudo -u postgres psql

# Dentro do PostgreSQL, execute:
CREATE DATABASE invoice_system;
CREATE USER invoice_user WITH PASSWORD 'SuaSenhaSegura123!';
GRANT ALL PRIVILEGES ON DATABASE invoice_system TO invoice_user;

# Conectar ao banco e dar permissões ao schema
\c invoice_system
GRANT ALL ON SCHEMA public TO invoice_user;
ALTER DATABASE invoice_system OWNER TO invoice_user;

# Sair
\q
\`\`\`

### 1.3 Executar Scripts SQL (EM ORDEM!)

**IMPORTANTE:** Execute os scripts na ordem correta:

**Primeiro - Habilitar extensões (como superusuário):**
\`\`\`bash
sudo -u postgres psql -d invoice_system -f scripts/00-enable-extensions-as-superuser.sql
\`\`\`

**Segundo - Criar estrutura do banco (como invoice_user):**
\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system -f scripts/01-complete-postgresql-setup.sql
\`\`\`

Quando solicitar a senha, digite: `SuaSenhaSegura123!` (ou a senha que você definiu)

## Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
# PostgreSQL Database
DATABASE_URL="postgresql://invoice_user:SuaSenhaSegura123!@localhost:5432/invoice_system"

# Session Secret (gere uma chave aleatória de 32+ caracteres)
SESSION_SECRET="sua-chave-secreta-aleatoria-minimo-32-caracteres"

# Next.js
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Vercel Blob (para upload de arquivos - opcional)
BLOB_READ_WRITE_TOKEN="seu-token-blob-vercel"
\`\`\`

**IMPORTANTE:** Para gerar uma chave secreta segura:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

## Passo 3: Instalar Dependências

\`\`\`bash
npm install
# ou
yarn install
\`\`\`

O sistema já inclui as dependências necessárias:
- `pg` - Driver PostgreSQL para Node.js
- `bcryptjs` - Para hash de senhas
- `@vercel/blob` - Para armazenamento de arquivos (opcional)

## Passo 4: Iniciar o Sistema

\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

Acesse: `http://localhost:3000`

## Passo 5: Criar Primeiro Usuário (Admin)

1. Acesse: `http://localhost:3000/auth/register`
2. Preencha os dados do primeiro usuário
3. **O primeiro usuário será automaticamente um Admin**
4. Faça login e configure sua empresa

## Estrutura do Banco de Dados

O script SQL cria automaticamente:

### Tabelas Principais:
- `companies` - Empresas
- `profiles` - Usuários e autenticação
- `sessions` - Sessões de login
- `clients` - Clientes
- `invoices` - Notas fiscais
- `invoice_items` - Itens das notas fiscais
- `payments` - Pagamentos
- `audit_logs` - Logs de auditoria
- `import_history` - Histórico de importações

### Índices:
- Mais de 25 índices para otimização de consultas

### Triggers:
- Atualização automática de timestamps
- Cálculo automático de valores
- Atualização de status de pagamento

### Views:
- Resumos financeiros mensais
- Análise de clientes
- Resumos de pagamento

## Verificar Instalação

### Testar Conexão com o Banco:

\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system -c "SELECT COUNT(*) FROM profiles;"
\`\`\`

### Verificar Tabelas Criadas:

\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system -c "\dt"
\`\`\`

## Backup e Restauração

### Fazer Backup:
\`\`\`bash
pg_dump -h localhost -U invoice_user -d invoice_system > backup_$(date +%Y%m%d).sql
\`\`\`

### Restaurar Backup:
\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system < backup_20250106.sql
\`\`\`

## Migração de Produção

### Para Servidor Linux (Ubuntu):

1. Instalar PostgreSQL no servidor
2. Configurar firewall (se necessário):
   \`\`\`bash
   sudo ufw allow 5432/tcp
   \`\`\`

3. Editar `postgresql.conf` para aceitar conexões externas (se necessário):
   \`\`\`bash
   sudo nano /etc/postgresql/16/main/postgresql.conf
   # Alterar: listen_addresses = '*'
   \`\`\`

4. Configurar `pg_hba.conf` para permitir conexões:
   \`\`\`bash
   sudo nano /etc/postgresql/16/main/pg_hba.conf
   # Adicionar: host all all 0.0.0.0/0 md5
   \`\`\`

5. Reiniciar PostgreSQL:
   \`\`\`bash
   sudo systemctl restart postgresql
   \`\`\`

### Deploy no Vercel/Netlify:

Use uma das seguintes opções para banco de dados em produção:
- **Neon** (https://neon.tech) - PostgreSQL serverless
- **Supabase** (https://supabase.com) - Com este código funciona sem usar auth do Supabase
- **Railway** (https://railway.app) - PostgreSQL gerenciado
- **DigitalOcean** - PostgreSQL gerenciado

Apenas configure `DATABASE_URL` no provedor escolhido.

## Troubleshooting

### Erro: "relation does not exist"
Execute o script SQL novamente:
\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system -f scripts/01-complete-postgresql-setup.sql
\`\`\`

### Erro: "password authentication failed"
Verifique a senha no arquivo `.env.local` e no comando `psql`

### Erro: "could not connect to server"
Verifique se o PostgreSQL está rodando:
\`\`\`bash
sudo systemctl status postgresql
\`\`\`

### Performance lenta
Verifique se os índices foram criados:
\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system -c "\di"
\`\`\`

## Diferenças do Supabase

✅ **Mantido:**
- Todas as funcionalidades do sistema
- Autenticação com sessões
- Logs de auditoria
- Upload de arquivos (via Vercel Blob)

❌ **Removido:**
- Row Level Security (RLS) - substituído por verificações no código
- Realtime - pode ser implementado com websockets se necessário
- Storage do Supabase - substituído por Vercel Blob

🔄 **Modificado:**
- Autenticação agora usa bcrypt + sessões em cookies
- Queries usam o driver `pg` direto
- Controle de acesso feito em cada query

## Suporte

Em caso de dúvidas ou problemas, verifique:
1. Logs do PostgreSQL: `sudo tail -f /var/log/postgresql/postgresql-16-main.log`
2. Logs do Next.js: No console onde rodou `npm run dev`
3. Variáveis de ambiente no `.env.local`
