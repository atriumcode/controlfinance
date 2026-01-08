#!/bin/bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}➜ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "Este script não deve ser executado como root!"
   exit 1
fi

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="172.16.5.42"
    print_warning "Não foi possível detectar IP automaticamente. Usando padrão: $SERVER_IP"
else
    print_info "IP detectado: $SERVER_IP"
fi

print_header "INSTALAÇÃO DO CONTROLFINANCE"
echo "Este script instalará:"
echo "  • Node.js 20 LTS (via NVM)"
echo "  • Docker e Docker Compose"
echo "  • Supabase CLI"
echo "  • PM2 para gerenciamento de processos"
echo "  • ControlFinance do GitHub"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_warning "Instalação cancelada pelo usuário"
    exit 0
fi

# ═══════════════════════════════════════════════════
# FASE 1: Preparação do Sistema
# ═══════════════════════════════════════════════════
print_header "[1/9] Preparando o Sistema"

print_info "Atualizando repositórios..."
sudo apt update -qq

print_info "Instalando dependências básicas..."
sudo apt install -y curl wget git build-essential libssl-dev ca-certificates apt-transport-https software-properties-common gnupg lsb-release > /dev/null 2>&1

print_success "Sistema preparado"

# ═══════════════════════════════════════════════════
# FASE 2: Instalação do Node.js via NVM
# ═══════════════════════════════════════════════════
print_header "[2/9] Instalando Node.js 20 LTS via NVM"

if [ -d "$HOME/.nvm" ]; then
    print_warning "NVM já instalado, pulando..."
else
    print_info "Baixando e instalando NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash > /dev/null 2>&1
fi

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

print_info "Instalando Node.js 20..."
nvm install 20
nvm use 20
nvm alias default 20

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

print_success "Node.js $NODE_VERSION instalado"
print_success "npm $NPM_VERSION instalado"

# ═══════════════════════════════════════════════════
# FASE 3: Instalação do Docker
# ═══════════════════════════════════════════════════
print_header "[3/9] Instalando Docker e Docker Compose"

if command -v docker &> /dev/null; then
    print_warning "Docker já instalado"
else
    print_info "Instalando Docker..."
    
    # Adicionar chave GPG do Docker
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Adicionar repositório Docker
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    sudo apt update -qq
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin > /dev/null 2>&1
    
    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    
    print_success "Docker instalado"
fi

# Verificar se Docker funciona
if docker ps &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | tr -d ',')
    print_success "Docker $DOCKER_VERSION funcionando"
else
    print_warning "Docker instalado mas sem permissão. Você precisa:"
    echo ""
    echo "  OPÇÃO 1: Fazer logout e login novamente"
    echo "  OPÇÃO 2: Executar: newgrp docker"
    echo "  OPÇÃO 3: Reiniciar o servidor"
    echo ""
    print_info "Depois, execute este script novamente: bash $0"
    exit 0
fi

# ═══════════════════════════════════════════════════
# FASE 4: Instalação do Supabase CLI
# ═══════════════════════════════════════════════════
print_header "[4/9] Instalando Supabase CLI"

if command -v supabase &> /dev/null; then
    print_warning "Supabase CLI já instalado"
    SUPABASE_VERSION=$(supabase --version 2>&1 | head -n1)
    print_info "$SUPABASE_VERSION"
else
    print_info "Baixando Supabase CLI v2.65.5..."
    cd /tmp
    
    DOWNLOAD_URL="https://github.com/supabase/cli/releases/download/v2.65.5/supabase_2.65.5_linux_amd64.deb"
    
    print_info "Baixando de $DOWNLOAD_URL..."
    if ! wget --timeout=30 --tries=3 --show-progress -O supabase_linux_amd64.deb "$DOWNLOAD_URL" 2>&1; then
        print_error "Falha ao baixar Supabase CLI v2.65.5"
        print_info "Você pode instalar manualmente com:"
        echo "  wget https://github.com/supabase/cli/releases/download/v2.65.5/supabase_2.65.5_linux_amd64.deb"
        echo "  sudo dpkg -i supabase_2.65.5_linux_amd64.deb"
        exit 1
    fi
    
    # Verificar se o arquivo foi baixado
    if [ ! -f "supabase_linux_amd64.deb" ] || [ ! -s "supabase_linux_amd64.deb" ]; then
        print_error "Arquivo do Supabase CLI não foi baixado"
        exit 1
    fi
    
    print_info "Instalando Supabase CLI..."
    sudo dpkg -i supabase_linux_amd64.deb 2>/dev/null || sudo apt -f install -y > /dev/null 2>&1
    
    # Verificar se instalou corretamente
    if ! command -v supabase &> /dev/null; then
        print_error "Falha ao instalar Supabase CLI"
        exit 1
    fi
    
    rm -f supabase_linux_amd64.deb
    
    SUPABASE_VERSION=$(supabase --version 2>&1 | head -n1)
    print_success "Supabase CLI instalado: $SUPABASE_VERSION"
fi

# ═══════════════════════════════════════════════════
# FASE 5: Instalação do PM2
# ═══════════════════════════════════════════════════
print_header "[5/9] Instalando PM2"

if command -v pm2 &> /dev/null; then
    print_warning "PM2 já instalado"
else
    print_info "Instalando PM2 globalmente (pode levar alguns minutos)..."
    
    # Instalar PM2 com timeout e mostrar output se falhar
    if timeout 300 npm install -g pm2; then
        print_success "PM2 instalado com sucesso"
        
        # Configurar PM2 startup
        print_info "Configurando PM2 startup..."
        pm2 startup systemd -u $USER --hp $HOME > /dev/null 2>&1 || print_warning "PM2 startup não configurado (não é crítico)"
    else
        print_error "Falha ao instalar PM2 (timeout ou erro)"
        print_info "Tentando instalar novamente sem timeout..."
        npm install -g pm2 || {
            print_error "Não foi possível instalar PM2"
            exit 1
        }
    fi
fi

# ═══════════════════════════════════════════════════
# FASE 6: Clone do Projeto
# ═══════════════════════════════════════════════════
print_header "[6/9] Clonando Projeto do GitHub"

PROJECT_DIR="$HOME/controlfinance"

if [ -d "$PROJECT_DIR" ]; then
    print_warning "Diretório $PROJECT_DIR já existe!"
    read -p "Deseja remover e clonar novamente? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -rf "$PROJECT_DIR"
        print_info "Diretório removido"
    else
        print_info "Usando diretório existente"
    fi
fi

if [ ! -d "$PROJECT_DIR" ]; then
    print_info "Clonando repositório..."
    git clone https://github.com/atriumcode/controlfinance.git "$PROJECT_DIR" > /dev/null 2>&1
    print_success "Projeto clonado para $PROJECT_DIR"
else
    print_info "Atualizando repositório existente..."
    cd "$PROJECT_DIR"
    git pull origin main > /dev/null 2>&1 || git pull origin master > /dev/null 2>&1
    print_success "Projeto atualizado"
fi

cd "$PROJECT_DIR"

# ═══════════════════════════════════════════════════
# FASE 7: Inicialização do Supabase
# ═══════════════════════════════════════════════════
print_header "[7/9] Configurando Supabase Local"

SUPABASE_DIR="$HOME/supabase-local"

if [ -d "$SUPABASE_DIR" ]; then
    print_warning "Supabase já inicializado em $SUPABASE_DIR"
    read -p "Deseja reiniciar o Supabase? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        cd "$SUPABASE_DIR"
        supabase stop > /dev/null 2>&1 || true
        cd ~
        rm -rf "$SUPABASE_DIR"
        print_info "Supabase resetado"
    fi
fi

if [ ! -d "$SUPABASE_DIR" ]; then
    print_info "Criando diretório Supabase..."
    mkdir -p "$SUPABASE_DIR"
    cd "$SUPABASE_DIR"
    
    print_info "Inicializando Supabase..."
    supabase init
    
    print_info "Iniciando containers Supabase (pode levar 5-10 minutos na primeira vez)..."
    print_warning "Aguarde... baixando e iniciando containers Docker"
    supabase start
    
    print_success "Supabase iniciado"
else
    cd "$SUPABASE_DIR"
    if ! supabase status > /dev/null 2>&1; then
        print_info "Iniciando Supabase (pode levar alguns minutos)..."
        supabase start
    else
        print_success "Supabase já está rodando"
    fi
fi

# Obter informações do Supabase
print_info "Obtendo configurações do Supabase..."
SUPABASE_API_URL=$(supabase status | grep "API URL" | awk '{print $3}')
SUPABASE_ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
SUPABASE_SERVICE_KEY=$(supabase status | grep "service_role key" | awk '{print $3}')

print_success "Supabase configurado"
echo "  API URL: $SUPABASE_API_URL"

# ═══════════════════════════════════════════════════
# FASE 8: Configuração do Projeto
# ═══════════════════════════════════════════════════
print_header "[8/9] Configurando Projeto"

cd "$PROJECT_DIR"

# Criar .env.local
print_info "Criando arquivo .env.local..."
cat > .env.local << EOF
# Supabase Configuration
SUPABASE_URL=${SUPABASE_API_URL}
NEXT_PUBLIC_SUPABASE_URL=http://${SERVER_IP}:54321
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}
NEXT_PUBLIC_SITE_URL=http://${SERVER_IP}:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://${SERVER_IP}:3000
EOF

print_success "Arquivo .env.local criado"

# Instalar dependências
print_info "Instalando dependências do projeto (pode levar alguns minutos)..."
npm install > /dev/null 2>&1
print_success "Dependências instaladas"

# Build do projeto
print_info "Fazendo build do Next.js (pode levar alguns minutos)..."
npm run build
print_success "Build concluído"

# ═══════════════════════════════════════════════════
# FASE 9: Inicialização da Aplicação
# ═══════════════════════════════════════════════════
print_header "[9/9] Iniciando Aplicação"

# Parar processos antigos se existirem
pm2 delete controlfinance 2>/dev/null || true

# Iniciar com PM2
print_info "Iniciando aplicação com PM2..."
pm2 start npm --name "controlfinance" -- start
pm2 save > /dev/null 2>&1

print_success "Aplicação iniciada"

# ═══════════════════════════════════════════════════
# FINALIZAÇÃO
# ═══════════════════════════════════════════════════
print_header "✓ Instalação Concluída!"

echo ""
echo -e "${GREEN}Acesse a aplicação em:${NC}"
echo -e "${BLUE}  → http://${SERVER_IP}:3000${NC}"
echo -e "${BLUE}  → http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}Supabase Studio:${NC}"
echo -e "${BLUE}  → http://${SERVER_IP}:54323${NC}"
echo ""
echo -e "${GREEN}Comandos úteis:${NC}"
echo -e "${BLUE}  pm2 logs controlfinance${NC}       # Ver logs da aplicação"
echo -e "${BLUE}  pm2 restart controlfinance${NC}    # Reiniciar aplicação"
echo -e "${BLUE}  pm2 stop controlfinance${NC}       # Parar aplicação"
echo -e "${BLUE}  supabase status${NC}                # Status do Supabase"
echo -e "${BLUE}  supabase stop${NC}                  # Parar Supabase"
echo ""
echo -e "${YELLOW}Credenciais padrão:${NC}"
echo -e "${BLUE}  Email: admin@empresateste.com.br${NC}"
echo -e "${BLUE}  Senha: admin123${NC}"
echo ""
echo -e "${GREEN}Diretórios:${NC}"
echo -e "${BLUE}  Projeto: $PROJECT_DIR${NC}"
echo -e "${BLUE}  Supabase: $SUPABASE_DIR${NC}"
echo ""
