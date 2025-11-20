#!/bin/bash

# Quick Start Script - Invoice System
# Este script automatiza a configuração inicial

set -e  # Exit on error

echo "======================================"
echo "Invoice System - Quick Start"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar pré-requisitos
check_prerequisites() {
    echo -e "${YELLOW}[1/7] Verificando pré-requisitos...${NC}"
    
    # Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js não encontrado. Instale Node.js 18+${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
    
    # npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm não encontrado${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm: $(npm --version)${NC}"
    
    # Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker não encontrado. Instale Docker${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker: $(docker --version)${NC}"
    
    # Docker Compose
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose não encontrado${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker Compose: $(docker compose version)${NC}"
    
    # psql
    if ! command -v psql &> /dev/null; then
        echo -e "${YELLOW}⚠ psql não encontrado. Instalando...${NC}"
        sudo apt update && sudo apt install -y postgresql-client
    fi
    echo -e "${GREEN}✓ psql instalado${NC}"
    
    echo ""
}

# Verificar Supabase
check_supabase() {
    echo -e "${YELLOW}[2/7] Verificando Supabase local...${NC}"
    
    if docker compose ps | grep -q "supabase-db.*Up"; then
        echo -e "${GREEN}✓ Supabase está rodando${NC}"
    else
        echo -e "${RED}❌ Supabase não está rodando${NC}"
        echo -e "${YELLOW}Iniciando Supabase...${NC}"
        
        # Procurar diretório do Supabase
        if [ -d "$HOME/projetos/supabase/docker" ]; then
            cd "$HOME/projetos/supabase/docker"
            docker compose up -d
            sleep 10
            echo -e "${GREEN}✓ Supabase iniciado${NC}"
        else
            echo -e "${RED}❌ Diretório do Supabase não encontrado${NC}"
            echo "Por favor, configure o Supabase primeiro seguindo o SETUP_UBUNTU.md"
            exit 1
        fi
    fi
    echo ""
}

# Testar conexão com banco
test_database() {
    echo -e "${YELLOW}[3/7] Testando conexão com banco de dados...${NC}"
    
    if psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✓ Conexão com banco OK${NC}"
    else
        echo -e "${RED}❌ Não foi possível conectar ao banco${NC}"
        echo "Verifique se o Supabase está rodando: docker compose ps"
        exit 1
    fi
    echo ""
}

# Executar scripts SQL
run_sql_scripts() {
    echo -e "${YELLOW}[4/7] Executando scripts SQL...${NC}"
    
    SCRIPT_DIR="$(dirname "$0")"
    DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"
    
    for file in "$SCRIPT_DIR"/00*.sql; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo -e "${YELLOW}  Executando: $filename${NC}"
            psql "$DB_URL" -f "$file" > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}  ✓ $filename executado com sucesso${NC}"
            else
                echo -e "${RED}  ❌ Erro ao executar $filename${NC}"
                exit 1
            fi
        fi
    done
    echo ""
}

# Instalar dependências
install_dependencies() {
    echo -e "${YELLOW}[5/7] Instalando dependências do projeto...${NC}"
    
    cd "$(dirname "$0")/../.."
    
    if [ -d "node_modules" ]; then
        echo -e "${YELLOW}  node_modules já existe. Limpando...${NC}"
        rm -rf node_modules package-lock.json
    fi
    
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Dependências instaladas${NC}"
    else
        echo -e "${RED}❌ Erro ao instalar dependências${NC}"
        exit 1
    fi
    echo ""
}

# Build do projeto
build_project() {
    echo -e "${YELLOW}[6/7] Fazendo build do projeto...${NC}"
    
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Build concluído${NC}"
    else
        echo -e "${RED}❌ Erro no build${NC}"
        exit 1
    fi
    echo ""
}

# Verificar .env.local
check_env() {
    echo -e "${YELLOW}[7/7] Verificando .env.local...${NC}"
    
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}  .env.local não encontrado. Criando...${NC}"
        cat > .env.local << 'EOF'
POSTGRES_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:54322/postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="localhost"
SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
SUPABASE_JWT_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000/auth/callback"
EOF
        echo -e "${GREEN}  ✓ .env.local criado${NC}"
    else
        echo -e "${GREEN}✓ .env.local já existe${NC}"
    fi
    echo ""
}

# Executar setup
main() {
    check_prerequisites
    check_supabase
    test_database
    run_sql_scripts
    install_dependencies
    check_env
    build_project
    
    echo ""
    echo -e "${GREEN}======================================"
    echo "✓ Setup concluído com sucesso!"
    echo "======================================${NC}"
    echo ""
    echo -e "${YELLOW}Para iniciar o sistema:${NC}"
    echo "  npm run dev    # Modo desenvolvimento"
    echo "  npm start      # Modo produção"
    echo ""
    echo -e "${YELLOW}Acesse:${NC}"
    echo "  http://localhost:3000"
    echo ""
    echo -e "${YELLOW}Login padrão:${NC}"
    echo "  Email: admin@netcom.com"
    echo "  Senha: Admin@123456"
    echo ""
}

# Executar
main
