# Guia Completo: Instalação no Ubuntu com Supabase Local

Este guia irá configurar o sistema completamente do zero no Ubuntu Linux usando Supabase self-hosted via Docker.

---

## PASSO 1: PRÉ-REQUISITOS

### 1.1 Instalar Node.js 18+ e npm

\`\`\`bash
# Instalar Node.js via nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verificar instalação
node --version  # Deve mostrar v18.x.x
npm --version   # Deve mostrar 9.x.x ou superior
\`\`\`

### 1.2 Verificar Docker e Docker Compose

\`\`\`bash
# Verificar se Docker está instalado
docker --version
docker compose version

# Se não estiver instalado:
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar seu usuário ao grupo docker (evita usar sudo)
sudo usermod -aG docker $USER
newgrp docker
\`\`\`

### 1.3 Instalar Git (se necessário)

\`\`\`bash
sudo apt install git -y
git --version
\`\`\`

---

## PASSO 2: CONFIGURAR SUPABASE LOCAL

### 2.1 Clonar Supabase CLI/Docker Setup

\`\`\`bash
# Criar diretório para projetos
mkdir -p ~/projetos
cd ~/projetos

# Clonar repositório do Supabase (método recomendado)
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# OU usar npx supabase init (alternativa)
# npx supabase init
\`\`\`

### 2.2 Iniciar Supabase Local

\`\`\`bash
# Iniciar todos os serviços do Supabase
docker compose up -d

# Verificar se todos os containers estão rodando
docker compose ps

# Aguardar ~30 segundos para todos os serviços iniciarem
sleep 30
\`\`\`

### 2.3 Verificar Acesso ao Supabase

Abra o navegador e acesse:
- **Supabase Studio**: http://localhost:8000
- **PostgreSQL**: localhost:54322
- **API**: http://localhost:54321

**Credenciais padrão:**
- Email: `admin@example.com`
- Senha: `password` (ou a que você configurou)

### 2.4 Obter as Credenciais de Conexão

\`\`\`bash
# As credenciais padrão do Supabase local são:
# Database URL: postgresql://postgres:postgres@localhost:54322/postgres
# Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Para obter as keys, verifique o arquivo .env dentro de supabase/docker/
cat .env | grep -E "ANON_KEY|SERVICE_ROLE_KEY"
\`\`\`

---

## PASSO 3: CONFIGURAR O BANCO DE DADOS

### 3.1 Conectar ao PostgreSQL Local

\`\`\`bash
# Opção 1: Usar psql (instalar se necessário)
sudo apt install postgresql-client -y
psql postgresql://postgres:postgres@localhost:54322/postgres

# Opção 2: Usar Supabase Studio (interface web)
# Acesse: http://localhost:8000
\`\`\`

### 3.2 Executar Scripts SQL na Ordem

**No terminal do psql ou no SQL Editor do Supabase Studio, execute na ordem:**

\`\`\`bash
# Navegar até a pasta do projeto
cd ~/projetos/invoice-system/scripts/setup

# Executar scripts na ordem (via psql)
psql postgresql://postgres:postgres@localhost:54322/postgres -f 001_create_base_tables.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f 002_create_business_tables.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f 003_create_support_tables.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f 004_configure_rls.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f 005_seed_initial_data.sql
\`\`\`

**OU via Supabase Studio:**
1. Acesse http://localhost:8000
2. Vá em "SQL Editor"
3. Copie e cole o conteúdo de cada arquivo SQL
4. Execute um por um na ordem

### 3.3 Verificar Tabelas Criadas

\`\`\`sql
-- No psql ou SQL Editor
\dt  -- Lista todas as tabelas

-- Ou
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
\`\`\`

Você deve ver estas tabelas:
- companies
- profiles
- sessions
- clients
- invoices
- invoice_items
- payments
- payment_methods
- bank_transactions
- audit_logs
- certificates
- import_history

---

## PASSO 4: CONFIGURAR O PROJETO NEXT.JS

### 4.1 Clonar/Copiar o Projeto

\`\`\`bash
cd ~/projetos

# Se já tiver o código:
cd invoice-system

# Se precisar clonar do repositório:
git clone <URL_DO_REPOSITORIO> invoice-system
cd invoice-system
\`\`\`

### 4.2 Criar Arquivo .env.local

\`\`\`bash
# Criar arquivo de ambiente
cat > .env.local << 'EOF'
# Database Connection (Supabase Local)
POSTGRES_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="localhost"

# Supabase Configuration (Local)
SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
SUPABASE_JWT_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"

# Application Settings
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000/auth/callback"

# Vercel Blob (opcional - só se usar upload de arquivos)
BLOB_READ_WRITE_TOKEN="seu-token-aqui-se-necessario"
EOF

# Verificar se foi criado
cat .env.local
\`\`\`

**IMPORTANTE:** As keys acima são as padrões do Supabase local. Se você alterou algo na configuração do Docker, use as keys corretas do seu `.env` do Supabase.

### 4.3 Instalar Dependências

\`\`\`bash
# Limpar cache (se necessário)
rm -rf node_modules package-lock.json

# Instalar todas as dependências
npm install

# Verificar se instalou corretamente
npm list --depth=0
\`\`\`

### 4.4 Build do Projeto

\`\`\`bash
# Fazer build do Next.js
npm run build

# Se houver erros, verifique e corrija antes de prosseguir
\`\`\`

---

## PASSO 5: EXECUTAR O PROJETO

### 5.1 Modo Desenvolvimento

\`\`\`bash
# Iniciar em modo dev (recomendado para testar)
npm run dev

# O servidor estará disponível em:
# http://localhost:3000
\`\`\`

### 5.2 Modo Produção

\`\`\`bash
# Build (se ainda não fez)
npm run build

# Iniciar em modo produção
npm start

# O servidor estará disponível em:
# http://localhost:3000
\`\`\`

### 5.3 Configurar PM2 (Produção com Auto-Restart)

\`\`\`bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo de configuração PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'invoice-system',
    script: 'npm',
    args: 'start',
    cwd: '/home/seu-usuario/projetos/invoice-system',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Editar o caminho 'cwd' no arquivo acima com seu usuário real
nano ecosystem.config.js

# Iniciar com PM2
pm2 start ecosystem.config.js

# Verificar status
pm2 status

# Ver logs
pm2 logs invoice-system

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save
\`\`\`

---

## PASSO 6: ACESSAR E TESTAR O SISTEMA

### 6.1 Acessar a Aplicação

Abra o navegador e acesse: **http://localhost:3000**

### 6.2 Fazer Login com Usuário Admin

Se você executou o `005_seed_initial_data.sql`, use:

**Email:** admin@netcom.com  
**Senha:** Admin@123456

Se NÃO executou o seed, você precisará criar o primeiro usuário manualmente.

### 6.3 Criar Primeiro Usuário Manualmente (se necessário)

\`\`\`sql
-- Conectar ao banco
psql postgresql://postgres:postgres@localhost:54322/postgres

-- Inserir empresa
INSERT INTO companies (id, name, cnpj, email, phone, address, city, state, zip_code, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Minha Empresa',
  '00.000.000/0001-00',
  'contato@minhaempresa.com',
  '(11) 9999-9999',
  'Rua Exemplo, 123',
  'São Paulo',
  'SP',
  '01000-000',
  NOW(),
  NOW()
) RETURNING id;

-- Copie o ID retornado acima e use no próximo comando

-- Inserir usuário admin (substitua YOUR_COMPANY_ID pelo ID da empresa)
INSERT INTO profiles (id, email, full_name, role, password_hash, company_id, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@minhaempresa.com',
  'Administrador',
  'admin',
  '$2a$10$rW8qVZxGhV5YLhPxPvXVLO5KNqX5VqH5bQJZJZJZJZJZJZJZJZJZJ',  -- Senha: Admin@123456
  'YOUR_COMPANY_ID',  -- Substitua aqui
  true,
  NOW(),
  NOW()
);
\`\`\`

---

## PASSO 7: VERIFICAÇÕES E TROUBLESHOOTING

### 7.1 Verificar Serviços

\`\`\`bash
# Verificar Supabase containers
docker compose ps

# Todos devem estar "Up" (healthy)
# - supabase-db
# - supabase-studio
# - supabase-rest
# - supabase-auth
# - etc.

# Verificar logs do Supabase
docker compose logs -f

# Verificar aplicação Next.js
# Se usando PM2:
pm2 logs invoice-system

# Se usando npm:
# Os logs aparecem direto no terminal
\`\`\`

### 7.2 Problemas Comuns

#### Erro: "Cannot connect to database"

\`\`\`bash
# Verificar se PostgreSQL está rodando
docker compose ps supabase-db

# Verificar porta
sudo netstat -tulpn | grep 54322

# Reiniciar Supabase
cd ~/projetos/supabase/docker
docker compose restart
\`\`\`

#### Erro: "ECONNREFUSED localhost:54321"

\`\`\`bash
# Verificar se API do Supabase está rodando
curl http://localhost:54321/rest/v1/

# Deve retornar JSON (não erro)

# Se falhar, reiniciar:
docker compose restart supabase-rest
\`\`\`

#### Erro: "Cannot find module" no Next.js

\`\`\`bash
# Reinstalar dependências
rm -rf node_modules package-lock.json .next
npm install
npm run build
\`\`\`

#### Erro: "Port 3000 already in use"

\`\`\`bash
# Encontrar processo usando a porta
sudo lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar outra porta
PORT=3001 npm run dev
\`\`\`

### 7.3 Verificar Conexão com Banco

\`\`\`bash
# Testar conexão direta
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT version();"

# Listar tabelas
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\dt"

# Contar registros
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT COUNT(*) FROM profiles;"
\`\`\`

---

## PASSO 8: CONFIGURAÇÕES ADICIONAIS (OPCIONAL)

### 8.1 Configurar Nginx como Reverse Proxy

\`\`\`bash
# Instalar Nginx
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/invoice-system

# Adicionar:
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Ativar configuração
sudo ln -s /etc/nginx/sites-available/invoice-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### 8.2 Configurar Firewall

\`\`\`bash
# Permitir portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # Next.js (se não usar Nginx)
sudo ufw enable
sudo ufw status
\`\`\`

### 8.3 Backup Automático do Banco

\`\`\`bash
# Criar script de backup
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups/invoice-system
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec supabase-db pg_dump -U postgres postgres > $BACKUP_DIR/backup_$TIMESTAMP.sql
# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
echo "Backup realizado: $BACKUP_DIR/backup_$TIMESTAMP.sql"
EOF

# Dar permissão de execução
chmod +x ~/backup-db.sh

# Adicionar ao crontab (backup diário às 2h da manhã)
crontab -e
# Adicionar linha:
# 0 2 * * * /home/seu-usuario/backup-db.sh
\`\`\`

---

## RESUMO DOS COMANDOS

\`\`\`bash
# 1. Verificar pré-requisitos
node --version
docker --version
docker compose version

# 2. Iniciar Supabase
cd ~/projetos/supabase/docker
docker compose up -d

# 3. Executar scripts SQL
cd ~/projetos/invoice-system/scripts/setup
for file in 00*.sql; do
  psql postgresql://postgres:postgres@localhost:54322/postgres -f "$file"
done

# 4. Configurar projeto
cd ~/projetos/invoice-system
npm install
npm run build

# 5. Iniciar aplicação
npm start
# OU
pm2 start ecosystem.config.js

# 6. Acessar
# http://localhost:3000
\`\`\`

---

## SUPORTE

Se encontrar problemas:

1. Verifique os logs do Supabase: `docker compose logs -f`
2. Verifique os logs da aplicação: `pm2 logs` ou terminal
3. Verifique a conexão com o banco: `psql postgresql://postgres:postgres@localhost:54322/postgres`
4. Reinicie os serviços: `docker compose restart && pm2 restart invoice-system`

---

**Sistema pronto para uso! 🚀**
