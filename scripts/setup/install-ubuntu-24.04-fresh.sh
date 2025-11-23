#!/bin/bash

################################################################################
# Script de Instalação Completa - Invoice System (NOVA INSTALAÇÃO)
# Ubuntu 24.04 LTS - Instalação do Zero Absoluto
# GitHub: https://github.com/atriumcode/controlfinance
################################################################################

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para print colorido
print_info() { echo -e "${CYAN}ℹ ${NC}$1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_step() { echo -e "${MAGENTA}➜${NC} ${BLUE}$1${NC}"; }

# Header
clear
echo -e "${CYAN}"
echo "════════════════════════════════════════════════════════"
echo "  Invoice System - Instalação Completa do Zero"
echo "  Ubuntu 24.04 LTS"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    print_error "Não execute este script como root (sudo)"
    print_info "Execute como usuário normal: bash install-ubuntu-24.04-fresh.sh"
    exit 1
fi

# Solicitar senha sudo uma vez
print_info "Este script precisa de permissões sudo"
sudo -v || exit 1

# Detectar IP local
LOCAL_IP=$(hostname -I | awk '{print $1}')
print_info "IP local detectado: $LOCAL_IP"
echo ""

# Diretório de instalação fixo
INSTALL_DIR="$HOME/projetos/invoice-system"
SUPABASE_DIR="$HOME/projetos/supabase"
GITHUB_REPO="https://github.com/atriumcode/controlfinance.git"

print_info "Instalando em: $INSTALL_DIR"
print_info "GitHub: $GITHUB_REPO"
echo ""

# Confirmação final
print_warning "Este script irá:"
echo "  1. Atualizar o sistema"
echo "  2. Instalar Node.js 20 LTS (via NVM)"
echo "  3. Instalar Docker e Docker Compose"
echo "  4. Instalar PostgreSQL Client, Git, PM2"
echo "  5. Configurar Supabase Local (Docker)"
echo "  6. Clonar projeto do GitHub"
echo "  7. Criar e popular banco de dados"
echo "  8. Instalar e configurar a aplicação"
echo "  9. Iniciar o sistema com PM2"
echo ""
read -p "Deseja continuar? (s/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
    print_info "Instalação cancelada"
    exit 0
fi

echo ""
print_step "Iniciando instalação..."
sleep 2

################################################################################
# FASE 1: ATUALIZAR SISTEMA E INSTALAR DEPENDÊNCIAS BÁSICAS
################################################################################

print_step "[1/9] Atualizando sistema e instalando dependências básicas..."
sudo apt update -qq
sudo apt upgrade -y -qq
sudo apt install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_success "Sistema atualizado"
echo ""

################################################################################
# FASE 2: INSTALAR NODE.JS VIA NVM
################################################################################

print_step "[2/9] Instalando Node.js 20 LTS via NVM..."

if [ -d "$HOME/.nvm" ]; then
    print_warning "NVM já instalado, pulando..."
else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
    print_success "NVM instalado"
fi

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js $NODE_VERSION instalado"
print_success "npm $NPM_VERSION instalado"
echo ""

################################################################################
# FASE 3: INSTALAR DOCKER E DOCKER COMPOSE
################################################################################

print_step "[3/9] Instalando Docker e Docker Compose..."

if command -v docker &> /dev/null; then
    print_warning "Docker já instalado"
else
    # Remover versões antigas
    sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Adicionar repositório Docker
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Instalar Docker
    sudo apt update -qq
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    print_info "Configurando permissões do Docker..."
    sudo usermod -aG docker $USER
    
    print_warning "═══════════════════════════════════════════════════════"
    print_warning "Docker instalado! Aplicando permissões..."
    print_warning "═══════════════════════════════════════════════════════"
    newgrp docker << EONG
        bash $0
EONG
    exit 0
fi

if ! docker ps &> /dev/null; then
    print_error "Docker sem permissão! Execute: newgrp docker"
    exit 1
fi

sudo systemctl start docker
sudo systemctl enable docker
print_success "Docker instalado e rodando"
echo ""

################################################################################
# FASE 4: INSTALAR FERRAMENTAS ADICIONAIS
################################################################################

print_step "[4/9] Instalando ferramentas adicionais..."

sudo apt install -y postgresql-client
npm install -g pm2
print_success "PostgreSQL Client e PM2 instalados"
echo ""

################################################################################
# FASE 5: CONFIGURAR SUPABASE LOCAL
################################################################################

print_step "[5/9] Configurando Supabase Local..."

if [ -d "$SUPABASE_DIR" ]; then
    print_warning "Supabase já existe, pulando clone"
else
    mkdir -p "$HOME/projetos"
    cd "$HOME/projetos"
    git clone --depth 1 https://github.com/supabase/supabase
    print_success "Supabase clonado"
fi

cd "$SUPABASE_DIR/docker"

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

print_info "Iniciando Supabase..."
docker compose up -d

print_info "Aguardando Supabase inicializar (60s)..."
sleep 60

print_success "Supabase iniciado"
echo ""

################################################################################
# FASE 6: CLONAR PROJETO DO GITHUB
################################################################################

print_step "[6/9] Clonando projeto do GitHub..."

if [ -d "$INSTALL_DIR" ]; then
    print_warning "Diretório já existe: $INSTALL_DIR"
    print_warning "Removendo diretório antigo..."
    rm -rf "$INSTALL_DIR"
fi

mkdir -p "$HOME/projetos"
cd "$HOME/projetos"

print_info "Clonando de: $GITHUB_REPO"
git clone "$GITHUB_REPO" invoice-system

cd "$INSTALL_DIR"
print_success "Projeto clonado"
echo ""

################################################################################
# FASE 7: CONFIGURAR BANCO DE DADOS
################################################################################

print_step "[7/9] Configurando banco de dados..."

# Aguardar PostgreSQL
print_info "Aguardando PostgreSQL..."
for i in {1..30}; do
    if docker exec supabase-db psql -U postgres -d postgres -c "SELECT 1" &>/dev/null; then
        print_success "PostgreSQL pronto"
        break
    fi
    sleep 2
done

# Executar scripts SQL
if [ -d "$INSTALL_DIR/scripts/setup" ]; then
    print_info "Executando scripts SQL..."
    for script in "$INSTALL_DIR/scripts/setup"/0*.sql; do
        if [ -f "$script" ]; then
            filename=$(basename "$script")
            print_info "  → $filename"
            docker exec -i supabase-db psql -U postgres -d postgres < "$script" >/dev/null 2>&1 || print_warning "  Erro em $filename (pode ser normal)"
        fi
    done
    print_success "Scripts SQL executados"
else
    print_warning "Scripts SQL não encontrados"
fi

echo ""

################################################################################
# FASE 8: CONFIGURAR APLICAÇÃO
################################################################################

print_step "[8/9] Configurando aplicação..."

# Obter chaves reais do Supabase Docker
ANON_KEY=$(docker exec supabase-kong env | grep SUPABASE_ANON_KEY | cut -d'=' -f2)
SERVICE_KEY=$(docker exec supabase-kong env | grep SUPABASE_SERVICE_KEY | cut -d'=' -f2)
JWT_SECRET=$(docker exec supabase-auth env | grep GOTRUE_JWT_SECRET | cut -d'=' -f2)

print_info "Criando .env.local com chaves reais..."
cat > .env.local << EOF
# Database Connection (Supabase Local)
POSTGRES_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="localhost"

# Supabase Configuration (Local) - PORTA 8000
SUPABASE_URL="http://localhost:8000"
NEXT_PUBLIC_SUPABASE_URL="http://${LOCAL_IP}:8000"
SUPABASE_ANON_KEY="${ANON_KEY}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${SERVICE_KEY}"
SUPABASE_JWT_SECRET="${JWT_SECRET}"

# Application Settings
NEXT_PUBLIC_SITE_URL="http://${LOCAL_IP}:3000"
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://${LOCAL_IP}:3000/auth/callback"

# Vercel Blob (opcional)
BLOB_READ_WRITE_TOKEN=""
EOF

print_success ".env.local criado"

# Instalar dependências
print_info "Instalando dependências..."
rm -rf node_modules .next
npm install

print_success "Dependências instaladas"

# Build
print_info "Fazendo build..."
npm run build

print_success "Build concluído"
echo ""

################################################################################
# FASE 9: INICIAR COM PM2
################################################################################

print_step "[9/9] Iniciando aplicação..."

pm2 delete invoice-system 2>/dev/null || true
pm2 start npm --name "invoice-system" -- start
pm2 startup | grep -oP 'sudo .*' | bash || true
pm2 save

print_success "Aplicação iniciada"
echo ""

################################################################################
# CONCLUÍDO
################################################################################

clear
echo -e "${GREEN}"
echo "════════════════════════════════════════════════════════"
echo "  ✓ Instalação Concluída!"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""
echo "  ${CYAN}Aplicação:${NC}        http://${LOCAL_IP}:3000"
echo "  ${CYAN}Supabase Studio:${NC}  http://localhost:8000"
echo ""
echo "  ${YELLOW}Ver logs:${NC}   pm2 logs invoice-system"
echo "  ${YELLOW}Status:${NC}     pm2 status"
echo ""
print_success "Sistema pronto! 🚀"
echo ""
