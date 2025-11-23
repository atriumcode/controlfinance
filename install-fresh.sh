#!/bin/bash

set -e  # Parar em caso de erro

echo "=========================================="
echo "INSTALAÇÃO COMPLETA - Ubuntu 24.04"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Obter IP da máquina
SERVER_IP=$(hostname -I | awk '{print $1}')
log_info "IP detectado: $SERVER_IP"

# ==========================================
# PASSO 1: Instalar Node.js 20 LTS via NVM
# ==========================================
log_info "Instalando Node.js 20 LTS via NVM..."

if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    nvm install 20
    nvm use 20
    nvm alias default 20
else
    log_warn "NVM já instalado"
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

log_info "Node.js $(node --version) instalado"
log_info "npm $(npm --version) instalado"

# ==========================================
# PASSO 2: Instalar Docker
# ==========================================
log_info "Instalando Docker..."

if ! command -v docker &> /dev/null; then
    sudo apt update
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    sudo usermod -aG docker $USER
    log_warn "Docker instalado. Você pode precisar fazer logout/login para aplicar permissões."
else
    log_warn "Docker já instalado"
fi

log_info "Docker $(docker --version) instalado"

# ==========================================
# PASSO 3: Instalar Supabase CLI
# ==========================================
log_info "Instalando Supabase CLI..."

if ! command -v supabase &> /dev/null; then
    sudo apt update
    sudo apt install -y postgresql-client
    
    wget https://github.com/supabase/cli/releases/download/v1.123.4/supabase_1.123.4_linux_amd64.deb
    sudo dpkg -i supabase_1.123.4_linux_amd64.deb
    rm supabase_1.123.4_linux_amd64.deb
else
    log_warn "Supabase CLI já instalado"
fi

log_info "Supabase CLI $(supabase --version) instalado"

# ==========================================
# PASSO 4: Instalar PM2 (gerenciador de processos Node.js)
# ==========================================
log_info "Instalando PM2..."

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    log_warn "PM2 já instalado"
fi

log_info "PM2 $(pm2 --version) instalado"

# ==========================================
# PASSO 5: Clonar projeto do GitHub
# ==========================================
log_info "Clonando projeto do GitHub..."

mkdir -p ~/projetos
cd ~/projetos

if [ -d "controlfinance" ]; then
    log_warn "Diretório controlfinance já existe. Removendo..."
    rm -rf controlfinance
fi

git clone https://github.com/atriumcode/controlfinance.git
cd controlfinance

log_info "Projeto clonado com sucesso"

# ==========================================
# PASSO 6: Instalar dependências do projeto
# ==========================================
log_info "Instalando dependências do projeto..."

npm install

log_info "Dependências instaladas"

# ==========================================
# PASSO 7: Iniciar Supabase local
# ==========================================
log_info "Iniciando Supabase local..."

mkdir -p ~/projetos/supabase
cd ~/projetos/supabase

if [ ! -f "config.toml" ]; then
    supabase init
fi

supabase start

log_info "Supabase iniciado"

# Aguardar Supabase estar pronto
sleep 10

# ==========================================
# PASSO 8: Obter chaves do Supabase
# ==========================================
log_info "Obtendo chaves do Supabase..."

ANON_KEY=$(docker exec supabase-kong env | grep SUPABASE_ANON_KEY | cut -d'=' -f2)
SERVICE_KEY=$(docker exec supabase-kong env | grep SUPABASE_SERVICE_KEY | cut -d'=' -f2)
JWT_SECRET=$(docker exec supabase-auth env | grep GOTRUE_JWT_SECRET | cut -d'=' -f2)

log_info "Chaves obtidas do Supabase Docker"

# ==========================================
# PASSO 9: Configurar .env.local
# ==========================================
log_info "Configurando .env.local..."

cd ~/projetos/controlfinance

cat > .env.local << EOF
# PostgreSQL Connection
POSTGRES_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="localhost"

# Supabase Configuration (porta 8000 do Kong Gateway)
SUPABASE_URL="http://localhost:8000"
NEXT_PUBLIC_SUPABASE_URL="http://${SERVER_IP}:8000"

# Supabase Keys
SUPABASE_ANON_KEY="${ANON_KEY}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${SERVICE_KEY}"
SUPABASE_JWT_SECRET="${JWT_SECRET}"

# Site URL
NEXT_PUBLIC_SITE_URL="http://${SERVER_IP}:3000"
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://${SERVER_IP}:3000"
EOF

log_info ".env.local criado"

# ==========================================
# PASSO 10: Configurar banco de dados
# ==========================================
log_info "Configurando banco de dados..."

# Executar scripts SQL na ordem
for script in scripts/setup/*.sql; do
    if [ -f "$script" ]; then
        log_info "Executando $(basename $script)..."
        docker exec -i supabase-db psql -U postgres -d postgres < "$script" || log_warn "Erro ao executar $script (pode ser esperado)"
    fi
done

log_info "Banco de dados configurado"

# ==========================================
# PASSO 11: Build do projeto
# ==========================================
log_info "Fazendo build do projeto..."

npm run build

log_info "Build concluído"

# ==========================================
# PASSO 12: Iniciar aplicação com PM2
# ==========================================
log_info "Iniciando aplicação com PM2..."

pm2 delete invoice-system 2>/dev/null || true
pm2 start npm --name "invoice-system" -- run dev
pm2 save
pm2 startup

log_info "Aplicação iniciada com PM2"

# ==========================================
# FINALIZAÇÃO
# ==========================================
echo ""
echo "=========================================="
echo -e "${GREEN}INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo "=========================================="
echo ""
echo "🌐 Acesse a aplicação em:"
echo "   http://${SERVER_IP}:3000"
echo ""
echo "👤 Credenciais de admin padrão:"
echo "   Email: admin@empresateste.com.br"
echo "   Senha: admin123"
echo ""
echo "📊 Comandos úteis:"
echo "   pm2 logs invoice-system    # Ver logs"
echo "   pm2 restart invoice-system # Reiniciar"
echo "   pm2 stop invoice-system    # Parar"
echo "   supabase status            # Status do Supabase"
echo ""
echo "📁 Diretórios:"
echo "   Projeto: ~/projetos/controlfinance"
echo "   Supabase: ~/projetos/supabase"
echo ""
