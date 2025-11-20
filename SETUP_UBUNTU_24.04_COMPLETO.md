# Guia Completo: Instalação do Zero no Ubuntu 24.04 LTS

Este guia configura o sistema **do absoluto zero** em um Ubuntu 24.04 limpo, sem nenhum requisito pré-instalado.

---

## 🎯 O QUE SERÁ INSTALADO

1. **Node.js 20 LTS** (via NVM)
2. **Docker** e **Docker Compose**
3. **PostgreSQL Client** (psql)
4. **Git**
5. **PM2** (gerenciador de processos)
6. **Nginx** (proxy reverso - opcional)
7. **Supabase Local** (via Docker)
8. **Invoice System** (aplicação Next.js)

---

## 📋 MÉTODO 1: INSTALAÇÃO AUTOMÁTICA (RECOMENDADO)

### Passo Único: Executar Script de Instalação

\`\`\`bash
# Baixar e executar o script de instalação completa
curl -fsSL https://raw.githubusercontent.com/SEU_REPO/invoice-system/main/scripts/setup/install-ubuntu-24.04.sh | bash

# OU se já tiver o projeto clonado:
cd /caminho/para/invoice-system
chmod +x scripts/setup/install-ubuntu-24.04.sh
./scripts/setup/install-ubuntu-24.04.sh
\`\`\`

**O script fará TUDO automaticamente:**
- ✅ Atualizar sistema
- ✅ Instalar todas as dependências
- ✅ Configurar Docker e Supabase
- ✅ Criar banco de dados
- ✅ Instalar e configurar a aplicação
- ✅ Iniciar o sistema

**Tempo estimado:** 10-15 minutos

---

## 📋 MÉTODO 2: INSTALAÇÃO MANUAL PASSO A PASSO

Use este método se preferir controle total ou se o script automático falhar.

### FASE 1: PREPARAÇÃO DO SISTEMA

#### 1.1 Atualizar Sistema

\`\`\`bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
\`\`\`

#### 1.2 Instalar Node.js 20 LTS via NVM

\`\`\`bash
# Instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Recarregar configuração do shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x
\`\`\`

#### 1.3 Instalar Docker e Docker Compose

\`\`\`bash
# Remover versões antigas (se existirem)
sudo apt remove -y docker docker-engine docker.io containerd runc

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar repositório oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalação
docker --version
docker compose version

# Adicionar usuário ao grupo docker (evita usar sudo)
sudo usermod -aG docker $USER

# Aplicar mudanças de grupo (ou faça logout/login)
newgrp docker

# Iniciar e habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Testar Docker
docker run hello-world
\`\`\`

#### 1.4 Instalar PostgreSQL Client

\`\`\`bash
sudo apt install -y postgresql-client

# Verificar
psql --version
\`\`\`

#### 1.5 Instalar PM2 Globalmente

\`\`\`bash
npm install -g pm2

# Verificar
pm2 --version
\`\`\`

---

### FASE 2: CONFIGURAR SUPABASE LOCAL

#### 2.1 Baixar Supabase via Docker

\`\`\`bash
# Criar diretório para projetos
mkdir -p ~/projetos
cd ~/projetos

# Clonar repositório oficial do Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
\`\`\`

#### 2.2 Configurar Variáveis de Ambiente do Supabase

\`\`\`bash
# Copiar arquivo de exemplo
cp .env.example .env

# IMPORTANTE: Editar o .env e definir senhas seguras
nano .env

# Altere pelo menos estas variáveis:
# POSTGRES_PASSWORD=sua-senha-segura-aqui
# JWT_SECRET=um-segredo-jwt-muito-longo-aqui (mínimo 32 caracteres)
# ANON_KEY=(gerado automaticamente no primeiro start)
# SERVICE_ROLE_KEY=(gerado automaticamente no primeiro start)
\`\`\`

#### 2.3 Iniciar Supabase

\`\`\`bash
# Iniciar todos os containers
docker compose up -d

# Aguardar inicialização (pode levar 1-2 minutos)
echo "Aguardando Supabase inicializar..."
sleep 60

# Verificar se todos os containers estão rodando
docker compose ps

# Deve listar todos como "Up" (healthy):
# - supabase-db (PostgreSQL)
# - supabase-studio (Interface Web)
# - supabase-kong (API Gateway)
# - supabase-auth (Autenticação)
# - supabase-rest (REST API)
# - supabase-realtime
# - supabase-storage
# - supabase-imgproxy
# - supabase-meta
\`\`\`

#### 2.4 Acessar Supabase Studio

Abra o navegador e acesse:
- **Supabase Studio**: http://localhost:8000
- **PostgreSQL**: `localhost:54322`
- **API REST**: http://localhost:54321

**Credenciais padrão (se não alterou o .env):**
- Usuário: `postgres`
- Senha: `postgres`

#### 2.5 Obter as Keys do Supabase

\`\`\`bash
# Ver as keys geradas
cat ~/projetos/supabase/docker/volumes/api/kong.yml | grep -A 5 "anon"

# OU acessar via Studio em: Settings > API
\`\`\`

Anote:
- `anon key` (chave pública)
- `service_role key` (chave de administração)

---

### FASE 3: CLONAR E CONFIGURAR O PROJETO

#### 3.1 Clonar Repositório

\`\`\`bash
cd ~/projetos

# Se tiver acesso ao repositório Git:
git clone https://github.com/SEU_USUARIO/invoice-system.git
cd invoice-system

# OU se já tiver o código:
# Copie o projeto para ~/projetos/invoice-system
\`\`\`

#### 3.2 Criar Arquivo de Ambiente (.env.local)

\`\`\`bash
cd ~/projetos/invoice-system

# Obter IP local da máquina
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "IP local detectado: $LOCAL_IP"

# Criar .env.local
cat > .env.local << EOF
# Database Connection (Supabase Local)
POSTGRES_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="localhost"

# Supabase Configuration (Local)
# Para servidor: use localhost
# Para rede: use o IP da máquina
SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_URL="http://${LOCAL_IP}:54321"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
SUPABASE_JWT_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"

# Application Settings
NEXT_PUBLIC_SITE_URL="http://${LOCAL_IP}:3000"
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://${LOCAL_IP}:3000/auth/callback"

# Vercel Blob (opcional)
BLOB_READ_WRITE_TOKEN=""
EOF

echo "✅ Arquivo .env.local criado com IP: $LOCAL_IP"
cat .env.local
\`\`\`

**IMPORTANTE:** Se você alterou as senhas no Supabase, atualize o `.env.local` com as keys corretas.

---

### FASE 4: CONFIGURAR BANCO DE DADOS

#### 4.1 Testar Conexão

\`\`\`bash
# Testar conexão direta
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT version();"

# Deve retornar a versão do PostgreSQL
\`\`\`

#### 4.2 Executar Scripts SQL

\`\`\`bash
cd ~/projetos/invoice-system/scripts/setup

# Executar scripts na ordem
for script in 001_create_base_tables.sql 002_create_business_tables.sql 003_create_support_tables.sql 004_configure_rls.sql 005_seed_initial_data.sql; do
  echo "Executando $script..."
  psql postgresql://postgres:postgres@localhost:54322/postgres -f "$script"
  if [ $? -eq 0 ]; then
    echo "✅ $script executado com sucesso"
  else
    echo "❌ Erro ao executar $script"
    exit 1
  fi
done

echo "✅ Todos os scripts SQL executados"
\`\`\`

#### 4.3 Verificar Tabelas Criadas

\`\`\`bash
# Listar todas as tabelas
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\dt"

# Verificar algumas tabelas específicas
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT COUNT(*) FROM profiles;"
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT COUNT(*) FROM companies;"
\`\`\`

---

### FASE 5: INSTALAR E INICIAR A APLICAÇÃO

#### 5.1 Instalar Dependências

\`\`\`bash
cd ~/projetos/invoice-system

# Limpar cache (se existir)
rm -rf node_modules package-lock.json .next

# Instalar todas as dependências
npm install

# Verificar se instalou corretamente
npm list --depth=0
\`\`\`

#### 5.2 Fazer Build do Projeto

\`\`\`bash
# Build de produção
npm run build

# Se houver erros, corrija antes de prosseguir
\`\`\`

#### 5.3 Iniciar em Modo Desenvolvimento (Teste)

\`\`\`bash
# Iniciar em modo dev
npm run dev

# Aplicação estará em: http://localhost:3000
# Ou: http://SEU_IP:3000 (acessível pela rede)
\`\`\`

Abra o navegador e teste o acesso. Se funcionar, pressione `Ctrl+C` para parar e prossiga para produção.

#### 5.4 Iniciar em Modo Produção com PM2

\`\`\`bash
cd ~/projetos/invoice-system

# Criar arquivo de configuração PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'invoice-system',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF

# Criar diretório de logs
mkdir -p logs

# Iniciar com PM2
pm2 start ecosystem.config.js

# Verificar status
pm2 status

# Ver logs em tempo real
pm2 logs invoice-system

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save
\`\`\`

---

### FASE 6: CONFIGURAÇÕES OPCIONAIS

#### 6.1 Configurar Nginx (Proxy Reverso)

\`\`\`bash
# Instalar Nginx
sudo apt install -y nginx

# Criar configuração
sudo tee /etc/nginx/sites-available/invoice-system << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/invoice-system /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
\`\`\`

Agora você pode acessar via:
- `http://SEU_IP` (porta 80, sem :3000)

#### 6.2 Configurar Firewall UFW

\`\`\`bash
# Habilitar UFW
sudo ufw --force enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Se não usar Nginx, permitir porta do Next.js
sudo ufw allow 3000/tcp

# Verificar regras
sudo ufw status numbered
\`\`\`

#### 6.3 Backup Automático do Banco de Dados

\`\`\`bash
# Criar script de backup
cat > ~/backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups/invoice-system
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Fazer backup
docker exec supabase-db pg_dump -U postgres postgres > "$BACKUP_FILE"

# Comprimir backup
gzip "$BACKUP_FILE"

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup realizado: ${BACKUP_FILE}.gz"
EOF

# Dar permissão de execução
chmod +x ~/backup-database.sh

# Testar backup manual
~/backup-database.sh

# Agendar backup diário (2h da manhã)
crontab -l > /tmp/crontab_temp 2>/dev/null || true
echo "0 2 * * * $HOME/backup-database.sh" >> /tmp/crontab_temp
crontab /tmp/crontab_temp
rm /tmp/crontab_temp

# Verificar crontab
crontab -l
\`\`\`

---

## 🚀 INICIAR O SISTEMA

Após toda a configuração:

\`\`\`bash
# 1. Verificar Supabase
cd ~/projetos/supabase/docker
docker compose ps

# 2. Verificar aplicação
pm2 status

# 3. Ver logs
pm2 logs invoice-system

# 4. Acessar sistema
# http://SEU_IP:3000 (sem Nginx)
# http://SEU_IP (com Nginx)
\`\`\`

### Credenciais Padrão

Se você executou o script de seed (005_seed_initial_data.sql):

**Email:** `admin@netcom.com`  
**Senha:** `Admin@123456`

---

## 🔧 TROUBLESHOOTING

### Problema: Docker não inicia

\`\`\`bash
# Verificar status do Docker
sudo systemctl status docker

# Reiniciar Docker
sudo systemctl restart docker

# Ver logs
sudo journalctl -u docker -n 50
\`\`\`

### Problema: Supabase não conecta

\`\`\`bash
# Verificar containers
cd ~/projetos/supabase/docker
docker compose ps

# Ver logs
docker compose logs -f supabase-db

# Reiniciar Supabase
docker compose restart
\`\`\`

### Problema: Aplicação não inicia

\`\`\`bash
# Ver logs do PM2
pm2 logs invoice-system --lines 100

# Reiniciar aplicação
pm2 restart invoice-system

# Verificar .env.local
cat ~/projetos/invoice-system/.env.local

# Fazer rebuild
cd ~/projetos/invoice-system
rm -rf .next
npm run build
pm2 restart invoice-system
\`\`\`

### Problema: Erro ao executar scripts SQL

\`\`\`bash
# Verificar conexão
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1;"

# Executar script manualmente e ver erro detalhado
psql postgresql://postgres:postgres@localhost:54322/postgres -f scripts/setup/001_create_base_tables.sql
\`\`\`

### Problema: Port 3000 em uso

\`\`\`bash
# Encontrar processo
sudo lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar outra porta
# Edite ecosystem.config.js e mude PORT: 3001
\`\`\`

---

## 📊 VERIFICAÇÕES FINAIS

Execute estes comandos para verificar se tudo está OK:

\`\`\`bash
# 1. Node.js
node --version
npm --version

# 2. Docker
docker --version
docker compose version
docker ps | grep supabase

# 3. Banco de dados
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT COUNT(*) FROM profiles;"

# 4. Aplicação
pm2 status
curl -I http://localhost:3000

# 5. Nginx (se configurado)
sudo nginx -t
curl -I http://localhost
\`\`\`

---

## 🎉 PRONTO!

Seu sistema está 100% funcional!

**Acesse:** `http://SEU_IP:3000` (ou `http://SEU_IP` com Nginx)

**Comandos úteis:**

\`\`\`bash
# Ver logs da aplicação
pm2 logs invoice-system

# Reiniciar aplicação
pm2 restart invoice-system

# Parar aplicação
pm2 stop invoice-system

# Ver logs do Supabase
cd ~/projetos/supabase/docker
docker compose logs -f

# Fazer backup do banco
~/backup-database.sh

# Atualizar código
cd ~/projetos/invoice-system
git pull
npm install
npm run build
pm2 restart invoice-system
\`\`\`

---

**Suporte:** Para problemas, verifique a seção TROUBLESHOOTING ou abra uma issue no repositório.
