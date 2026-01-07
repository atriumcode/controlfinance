#!/bin/bash

# Script de configuração automática para PostgreSQL local
# Execute com: bash setup-local-postgres.sh

set -e

echo "=== Configuração do Sistema de Notas Fiscais com PostgreSQL Local ==="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
    echo "Por favor, não execute como root"
    exit 1
fi

# 1. Instalar PostgreSQL
echo -e "${YELLOW}[1/8] Instalando PostgreSQL...${NC}"
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# 2. Criar banco de dados e usuário
echo -e "${YELLOW}[2/8] Configurando banco de dados...${NC}"
read -p "Digite a senha para o usuário do banco (invoice_user): " DB_PASSWORD

sudo -u postgres psql <<EOF
CREATE DATABASE invoice_system;
CREATE USER invoice_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE invoice_system TO invoice_user;
\c invoice_system
GRANT ALL ON SCHEMA public TO invoice_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO invoice_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO invoice_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO invoice_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO invoice_user;
EOF

echo -e "${GREEN}✓ Banco de dados criado${NC}"

# 3. Instalar Node.js
echo -e "${YELLOW}[3/8] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo -e "${GREEN}✓ Node.js instalado: $(node --version)${NC}"

# 4. Instalar dependências do projeto
echo -e "${YELLOW}[4/8] Instalando dependências...${NC}"
npm install
echo -e "${GREEN}✓ Dependências instaladas${NC}"

# 5. Criar arquivo .env.local
echo -e "${YELLOW}[5/8] Criando arquivo de configuração...${NC}"
cat > .env.local <<EOF
# PostgreSQL Local Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=invoice_user
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DATABASE=invoice_system

# Connection URLs
POSTGRES_URL=postgresql://invoice_user:$DB_PASSWORD@localhost:5432/invoice_system
POSTGRES_PRISMA_URL=postgresql://invoice_user:$DB_PASSWORD@localhost:5432/invoice_system
POSTGRES_URL_NON_POOLING=postgresql://invoice_user:$DB_PASSWORD@localhost:5432/invoice_system

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=production

# Session Secret
SESSION_SECRET=$(openssl rand -base64 32)

# Upload Directory
UPLOAD_DIR=$(pwd)/uploads
EOF

echo -e "${GREEN}✓ Arquivo .env.local criado${NC}"

# 6. Criar diretório de uploads
echo -e "${YELLOW}[6/8] Criando diretório de uploads...${NC}"
mkdir -p uploads/company-logos
chmod 755 uploads
echo -e "${GREEN}✓ Diretório de uploads criado${NC}"

# 7. Executar migrations
echo -e "${YELLOW}[7/8] Executando migrations do banco de dados...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h localhost -U invoice_user -d invoice_system -f scripts/001_create_database_schema.sql
PGPASSWORD=$DB_PASSWORD psql -h localhost -U invoice_user -d invoice_system -f scripts/002_create_rls_policies.sql
PGPASSWORD=$DB_PASSWORD psql -h localhost -U invoice_user -d invoice_system -f scripts/022_add_logo_column.sql
echo -e "${GREEN}✓ Migrations executadas${NC}"

# 8. Build da aplicação
echo -e "${YELLOW}[8/8] Compilando aplicação...${NC}"
npm run build
echo -e "${GREEN}✓ Build concluído${NC}"

echo ""
echo -e "${GREEN}=== Instalação Concluída! ===${NC}"
echo ""
echo "Para iniciar a aplicação:"
echo "  npm start"
echo ""
echo "Para iniciar em modo desenvolvimento:"
echo "  npm run dev"
echo ""
echo "Para configurar PM2 (produção):"
echo "  sudo npm install -g pm2"
echo "  pm2 start npm --name invoice-system -- start"
echo "  pm2 startup"
echo "  pm2 save"
echo ""
