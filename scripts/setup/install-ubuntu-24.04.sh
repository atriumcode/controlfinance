#!/bin/bash

################################################################################
# Script de Instalação Completa - Invoice System
# Ubuntu 24.04 LTS - Instalação do Zero Absoluto
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
echo "  Invoice System - Instalação Completa"
echo "  Ubuntu 24.04 LTS"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    print_error "Não execute este script como root (sudo)"
    print_info "Execute como usuário normal: ./install-ubuntu-24.04.sh"
    exit 1
fi

# Solicitar senha sudo uma vez
print_info "Este script precisa de permissões sudo"
sudo -v || exit 1

# Detectar IP local
LOCAL_IP=$(hostname -I | awk '{print $1}')
print_info "IP local detectado: $LOCAL_IP"
echo ""

# Perguntar onde instalar
print_step "Onde deseja instalar o projeto?"
read -p "Caminho (padrão: $HOME/projetos/invoice-system): " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-"$HOME/projetos/invoice-system"}
PROJECTS_DIR=$(dirname "$INSTALL_DIR")

print_info "Instalando em: $INSTALL_DIR"
echo ""

# Confirmação final
print_warning "Este script irá:"
echo "  1. Atualizar o sistema"
echo "  2. Instalar Node.js 20 LTS (via NVM)"
echo "  3. Instalar Docker e Docker Compose"
echo "  4. Instalar PostgreSQL Client, Git, PM2"
echo "  5. Configurar Supabase Local (Docker)"
echo "  6. Criar e popular banco de dados"
echo "  7. Instalar e configurar a aplicação"
echo "  8. Iniciar o sistema com PM2"
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

print_step "[1/8] Atualizando sistema e instalando dependências básicas..."
sudo apt update -qq
sudo apt upgrade -y -qq
sudo apt install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_success "Sistema atualizado"
echo ""

################################################################################
# FASE 2: INSTALAR NODE.JS VIA NVM
################################################################################

print_step "[2/8] Instalando Node.js 20 LTS via NVM..."

if [ -d "$HOME/.nvm" ]; then
    print_warning "NVM já instalado, pulando..."
else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
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

print_step "[3/8] Instalando Docker e Docker Compose..."

if command -v docker &> /dev/null; then
    print_warning "Docker já instalado, pulando..."
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
    
    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    
    print_warning "═══════════════════════════════════════════════════════"
    print_warning "ATENÇÃO: Docker instalado com sucesso!"
    print_warning ""
    print_warning "Você foi adicionado ao grupo docker."
    print_warning "Para aplicar as permissões, escolha UMA opção:"
    print_warning ""
    print_warning "OPÇÃO 1: Fazer logout/login (Recomendado)"
    print_warning "OPÇÃO 2: Executar: newgrp docker"
    print_warning "OPÇÃO 3: Reiniciar: sudo reboot"
    print_warning ""
    print_warning "Após isso, execute novamente este script:"
    print_warning "  bash $0"
    print_warning "═══════════════════════════════════════════════════════"
    echo ""
    
    exit 0
fi

if ! docker ps &> /dev/null 2>&1; then
    print_error "Docker está instalado mas você não tem permissão para usá-lo!"
    print_warning ""
    print_warning "Execute um dos comandos abaixo:"
    print_warning "  • newgrp docker    (aplica temporariamente)"
    print_warning "  • sudo reboot      (aplica definitivamente)"
    print_warning ""
    print_warning "Depois execute novamente: bash $0"
    exit 1
fi

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

DOCKER_VERSION=$(docker --version)
COMPOSE_VERSION=$(docker compose version)
print_success "$DOCKER_VERSION"
print_success "$COMPOSE_VERSION"
echo ""

################################################################################
# FASE 4: INSTALAR FERRAMENTAS ADICIONAIS
################################################################################

print_step "[4/8] Instalando ferramentas adicionais..."

# PostgreSQL Client
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql-client
    print_success "PostgreSQL Client instalado"
else
    print_warning "PostgreSQL Client já instalado"
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_success "PM2 instalado"
else
    print_warning "PM2 já instalado"
fi

echo ""

################################################################################
# FASE 5: CONFIGURAR SUPABASE LOCAL
################################################################################

print_step "[5/8] Configurando Supabase Local..."

SUPABASE_DIR="$PROJECTS_DIR/supabase"

if [ -d "$SUPABASE_DIR/docker" ]; then
    print_warning "Supabase já existe em $SUPABASE_DIR"
else
    mkdir -p "$PROJECTS_DIR"
    cd "$PROJECTS_DIR"
    git clone --depth 1 https://github.com/supabase/supabase
    print_success "Supabase clonado"
fi

cd "$SUPABASE_DIR/docker"

# Configurar .env se não existir
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success ".env criado com configurações padrão"
else
    print_warning ".env já existe, usando existente"
fi

# Iniciar Supabase
print_info "Iniciando containers do Supabase (pode levar 1-2 minutos)..."
docker compose up -d

# Aguardar inicialização
print_info "Aguardando Supabase inicializar..."
sleep 60

# Verificar status
CONTAINERS_UP=$(docker compose ps --status running | grep -c "Up" || true)
print_success "Supabase iniciado ($CONTAINERS_UP containers rodando)"
echo ""

################################################################################
# FASE 6: CONFIGURAR BANCO DE DADOS
################################################################################

print_step "[6/8] Configurando banco de dados..."

# Aguardar PostgreSQL ficar pronto
print_info "Aguardando PostgreSQL ficar pronto..."
for i in {1..30}; do
    if psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1" &>/dev/null; then
        print_success "PostgreSQL está pronto"
        break
    fi
    sleep 2
done

print_info "Executando scripts SQL..."

# Verificar se scripts existem no diretório de instalação
if [ -d "$INSTALL_DIR/scripts/setup" ]; then
    SQL_DIR="$INSTALL_DIR/scripts/setup"
else
    # Scripts ainda não estão disponíveis, pular por enquanto
    SQL_DIR=""
fi

if [ -n "$SQL_DIR" ] && [ -d "$SQL_DIR" ]; then
    for script in "$SQL_DIR"/0*.sql; do
        if [ -f "$script" ]; then
            filename=$(basename "$script")
            print_info "  Executando: $filename"
            if psql postgresql://postgres:postgres@localhost:54322/postgres -f "$script" 2>&1 | tee /tmp/sql-error.log | grep -q "ERROR"; then
                print_error "  Erro ao executar $filename"
                print_error "  Verifique o log: /tmp/sql-error.log"
            else
                print_success "  $filename executado"
            fi
        fi
    done
else
    print_warning "Scripts SQL não encontrados em $SQL_DIR"
    print_warning "Você precisará executar os scripts SQL manualmente após a instalação:"
    print_warning "  cd $INSTALL_DIR/scripts/setup"
    print_warning "  psql postgresql://postgres:postgres@localhost:54322/postgres -f 001_create_base_tables.sql"
    print_warning "  psql postgresql://postgres:postgres@localhost:54322/postgres -f 002_create_business_tables.sql"
    print_warning "  (e assim por diante...)"
fi

echo ""

################################################################################
# FASE 7: INSTALAR E CONFIGURAR APLICAÇÃO
################################################################################

print_step "[7/8] Instalando aplicação..."

# Criar diretório e clonar/copiar projeto
mkdir -p "$PROJECTS_DIR"

if [ ! -d "$INSTALL_DIR" ]; then
    print_warning "Projeto não encontrado em $INSTALL_DIR"
    print_info "Por favor, clone ou copie o projeto para $INSTALL_DIR primeiro"
    print_info ""
    print_info "Exemplo de como clonar do GitHub:"
    print_info "  git clone https://github.com/seu-usuario/invoice-system.git $INSTALL_DIR"
    print_info ""
    print_info "Ou copie os arquivos manualmente para: $INSTALL_DIR"
    print_info ""
    print_info "Depois execute este script novamente:"
    print_info "  bash $0"
    echo ""
    exit 0
fi

sudo chown -R $USER:$USER "$INSTALL_DIR" 2>/dev/null || true

cd "$INSTALL_DIR"

print_info "Criando .env.local..."

if [ ! -w "$INSTALL_DIR" ]; then
    print_error "Sem permissão de escrita em $INSTALL_DIR"
    print_info "Corrigindo permissões..."
    sudo chown -R $USER:$USER "$INSTALL_DIR"
fi

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

print_success ".env.local criado com IP: $LOCAL_IP"

# Instalar dependências
print_info "Instalando dependências npm (pode levar alguns minutos)..."
rm -rf node_modules package-lock.json .next 2>/dev/null || true
npm install

print_success "Dependências instaladas"

# Build do projeto
print_info "Fazendo build do projeto (pode levar alguns minutos)..."
npm run build

print_success "Build concluído"
echo ""

################################################################################
# FASE 8: INICIAR APLICAÇÃO COM PM2
################################################################################

print_step "[8/8] Iniciando aplicação..."

# Criar ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'invoice-system',
    script: 'npm',
    args: 'start',
    cwd: '${INSTALL_DIR}',
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

# Parar PM2 se já estiver rodando
pm2 delete invoice-system 2>/dev/null || true

# Iniciar com PM2
pm2 start ecosystem.config.js

# Configurar PM2 para iniciar no boot
pm2 startup | grep -oP 'sudo .*' | sh || true
pm2 save

print_success "Aplicação iniciada com PM2"
echo ""

################################################################################
# INSTALAÇÃO CONCLUÍDA
################################################################################

clear
echo -e "${GREEN}"
echo "════════════════════════════════════════════════════════"
echo "  ✓ Instalação Concluída com Sucesso!"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

print_info "Informações do Sistema:"
echo ""
echo "  ${CYAN}Aplicação:${NC}        http://${LOCAL_IP}:3000"
echo "  ${CYAN}Supabase Studio:${NC}  http://localhost:8000"
echo "  ${CYAN}PostgreSQL:${NC}       localhost:54322"
echo "  ${CYAN}API Supabase:${NC}     http://localhost:54321"
echo ""

print_info "Credenciais Padrão:"
echo ""
echo "  ${CYAN}Email:${NC}  admin@netcom.com"
echo "  ${CYAN}Senha:${NC}  Admin@123456"
echo ""

print_info "Comandos Úteis:"
echo ""
echo "  ${YELLOW}Ver logs:${NC}             pm2 logs invoice-system"
echo "  ${YELLOW}Reiniciar app:${NC}        pm2 restart invoice-system"
echo "  ${YELLOW}Parar app:${NC}            pm2 stop invoice-system"
echo "  ${YELLOW}Status:${NC}               pm2 status"
echo "  ${YELLOW}Logs Supabase:${NC}        cd $SUPABASE_DIR/docker && docker compose logs -f"
echo ""

print_warning "IMPORTANTE:"
echo "  - Acesse a aplicação em: ${CYAN}http://${LOCAL_IP}:3000${NC}"
echo "  - Se acessar de outra máquina na rede, use o IP: ${LOCAL_IP}"
echo "  - Para aplicar permissões Docker sem reiniciar: ${YELLOW}newgrp docker${NC}"
echo ""

print_success "Sistema pronto para uso! 🚀"
echo ""
