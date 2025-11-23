# Guia de Instalação Completa - Ubuntu 24.04 do Zero

## Pré-requisitos
- Ubuntu 24.04 limpo instalado
- Acesso à internet
- Repositório GitHub do projeto

---

## PASSO 1: Atualizar Sistema

\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

---

## PASSO 2: Instalar Node.js 20.x

\`\`\`bash
# Instalar Node.js 20.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x
\`\`\`

---

## PASSO 3: Instalar Docker

\`\`\`bash
# Instalar Docker
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker (sem precisar sudo)
sudo usermod -aG docker $USER

# Aplicar mudanças de grupo (ou faça logout/login)
newgrp docker

# Verificar instalação
docker --version
docker compose version
\`\`\`

---

## PASSO 4: Instalar Git

\`\`\`bash
sudo apt install -y git
git --version
\`\`\`

---

## PASSO 5: Clonar Projeto do GitHub

\`\`\`bash
# Criar diretório de projetos
mkdir -p ~/projetos
cd ~/projetos

# Clonar repositório (substitua pela URL do seu repositório)
git clone <URL_DO_SEU_REPOSITORIO_GITHUB>

# Exemplo:
# git clone https://github.com/seu-usuario/invoice-system.git

# Entrar no diretório
cd invoice-system  # (ou o nome do seu repositório)
\`\`\`

---

## PASSO 6: Instalar Dependências do Projeto

\`\`\`bash
npm install
\`\`\`

---

## PASSO 7: Configurar Supabase Local (Docker)

\`\`\`bash
# Criar diretório para Supabase
mkdir -p ~/projetos/supabase
cd ~/projetos/supabase

# Baixar docker-compose.yml do Supabase
curl -o docker-compose.yml https://raw.githubusercontent.com/supabase/supabase/master/docker/docker-compose.yml

# Baixar .env de exemplo
curl -o .env https://raw.githubusercontent.com/supabase/supabase/master/docker/.env.example

# Iniciar Supabase
docker compose up -d

# Aguardar inicialização (pode levar 2-3 minutos)
sleep 120

# Verificar se todos containers estão rodando
docker ps
\`\`\`

**Containers esperados (13 no total):**
- supabase-db (PostgreSQL)
- supabase-kong (API Gateway)
- supabase-auth
- supabase-rest
- supabase-realtime
- supabase-storage
- supabase-studio
- supabase-meta
- supabase-analytics
- supabase-vector
- supabase-imgproxy
- supabase-edge-functions
- supabase-pooler

---

## PASSO 8: Obter Chaves do Supabase

\`\`\`bash
# Ver a ANON_KEY
docker exec supabase-kong env | grep SUPABASE_ANON_KEY

# Ver a SERVICE_ROLE_KEY
docker exec supabase-kong env | grep SUPABASE_SERVICE_KEY

# Ver o JWT_SECRET
docker exec supabase-auth env | grep GOTRUE_JWT_SECRET
\`\`\`

**Anote essas 3 chaves**, você vai precisar delas no próximo passo.

---

## PASSO 9: Configurar Variáveis de Ambiente

\`\`\`bash
cd ~/projetos/invoice-system

# Criar arquivo .env.local
nano .env.local
\`\`\`

**Cole este conteúdo** (substitua as chaves pelas obtidas no PASSO 8):

\`\`\`env
# PostgreSQL Database
POSTGRES_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:54322/postgres?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="localhost"

# Supabase (Server-side - localhost)
SUPABASE_URL="http://localhost:8000"
SUPABASE_ANON_KEY="<COLE_A_ANON_KEY_AQUI>"
SUPABASE_SERVICE_ROLE_KEY="<COLE_A_SERVICE_ROLE_KEY_AQUI>"
SUPABASE_JWT_SECRET="<COLE_O_JWT_SECRET_AQUI>"

# Supabase (Client-side - IP da máquina na rede)
NEXT_PUBLIC_SUPABASE_URL="http://<SEU_IP_LOCAL>:8000"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<COLE_A_ANON_KEY_AQUI>"

# Site URL
NEXT_PUBLIC_SITE_URL="http://<SEU_IP_LOCAL>:3000"
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000"

# Vercel Blob (deixe vazio por enquanto)
BLOB_READ_WRITE_TOKEN=""
\`\`\`

**Como descobrir seu IP local:**
\`\`\`bash
ip addr show | grep "inet " | grep -v 127.0.0.1
\`\`\`

Salve o arquivo (Ctrl+O, Enter, Ctrl+X).

---

## PASSO 10: Executar Scripts SQL (Criar Banco de Dados)

\`\`\`bash
cd ~/projetos/invoice-system

# Executar scripts na ordem correta
docker exec -i supabase-db psql -U postgres -d postgres < scripts/001_create_database_schema.sql
docker exec -i supabase-db psql -U postgres -d postgres < scripts/002_create_admin_user.sql
docker exec -i supabase-db psql -U postgres -d postgres < scripts/003_seed_initial_data.sql

# Verificar se as tabelas foram criadas
docker exec supabase-db psql -U postgres -d postgres -c "\dt"
\`\`\`

---

## PASSO 11: Build do Projeto

\`\`\`bash
cd ~/projetos/invoice-system

# Fazer build de produção
npm run build
\`\`\`

---

## PASSO 12: Instalar e Configurar PM2

\`\`\`bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar aplicação com PM2
pm2 start npm --name "invoice-system" -- start

# Salvar configuração
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que o PM2 sugerir (começa com sudo)

# Ver logs
pm2 logs invoice-system
\`\`\`

---

## PASSO 13: Acessar Sistema

Abra o navegador e acesse:
\`\`\`
http://<SEU_IP_LOCAL>:3000
\`\`\`

**Credenciais padrão:**
- Email: `admin@empresateste.com.br`
- Senha: `admin123`

---

## Comandos Úteis

### Gerenciar Aplicação
\`\`\`bash
pm2 list                    # Listar processos
pm2 logs invoice-system     # Ver logs em tempo real
pm2 restart invoice-system  # Reiniciar aplicação
pm2 stop invoice-system     # Parar aplicação
pm2 delete invoice-system   # Remover do PM2
\`\`\`

### Gerenciar Supabase
\`\`\`bash
cd ~/projetos/supabase
docker compose ps           # Ver status dos containers
docker compose logs -f      # Ver logs em tempo real
docker compose stop         # Parar todos os containers
docker compose start        # Iniciar containers
docker compose restart      # Reiniciar containers
\`\`\`

### Acessar Banco de Dados
\`\`\`bash
docker exec -it supabase-db psql -U postgres -d postgres
\`\`\`

---

## Solução de Problemas

### Aplicação não inicia
\`\`\`bash
# Ver logs detalhados
pm2 logs invoice-system --err

# Tentar em modo desenvolvimento
pm2 delete invoice-system
cd ~/projetos/invoice-system
npm run dev
\`\`\`

### Supabase não conecta
\`\`\`bash
# Verificar se containers estão rodando
docker ps

# Verificar logs do Kong (API Gateway)
docker logs supabase-kong

# Reiniciar Supabase
cd ~/projetos/supabase
docker compose restart
\`\`\`

### Erro de permissão Docker
\`\`\`bash
sudo usermod -aG docker $USER
newgrp docker
\`\`\`

---

## Próximos Passos

1. Configurar backup automático do banco de dados
2. Configurar HTTPS com certificado SSL
3. Configurar firewall (ufw)
4. Criar usuários adicionais
5. Configurar empresa no sistema

---

**Instalação concluída!** 🎉
