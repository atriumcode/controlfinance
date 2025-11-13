# Guia de Instalação - Sistema de Gestão de Notas Fiscais

Este guia documenta a instalação completa do sistema em um servidor Ubuntu/Debian com PostgreSQL.

## Pré-requisitos

- Ubuntu 20.04+ ou Debian 11+
- Node.js 18+
- PostgreSQL 14+
- PM2 (gerenciador de processos)

## 1. Instalar Dependências do Sistema

\`\`\`bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar PM2 globalmente
sudo npm install -g pm2
\`\`\`

## 2. Configurar PostgreSQL

\`\`\`bash
# Acessar PostgreSQL como superusuário
sudo -u postgres psql

# Criar banco de dados e usuário
CREATE DATABASE invoice_system;
CREATE USER invoice_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE invoice_system TO invoice_user;
\c invoice_system
GRANT ALL ON SCHEMA public TO invoice_user;
\q
\`\`\`

## 3. Clonar e Configurar o Projeto

\`\`\`bash
# Clonar repositório
cd /var/www
git clone https://github.com/seu-usuario/invoice-system.git
cd invoice-system

# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.example .env.local
\`\`\`

## 4. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local`:

\`\`\`bash
# Database
DATABASE_URL="postgresql://invoice_user:sua_senha_segura@localhost:5432/invoice_system"
POSTGRES_URL="postgresql://invoice_user:sua_senha_segura@localhost:5432/invoice_system"

# Vercel Blob (para upload de imagens)
BLOB_READ_WRITE_TOKEN="seu_token_vercel_blob"

# Site URL
NEXT_PUBLIC_SITE_URL="http://seu-dominio.com"
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000"
\`\`\`

## 5. Executar Scripts SQL

\`\`\`bash
# Executar script principal de criação do banco
psql -h localhost -U invoice_user -d invoice_system -f scripts/database-setup.sql

# Adicionar coluna logo_url
psql -h localhost -U invoice_user -d invoice_system -f scripts/add-logo-column.sql
\`\`\`

## 6. Build e Deploy

\`\`\`bash
# Build do projeto
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
\`\`\`

## 7. Configurar Nginx (Opcional)

\`\`\`nginx
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
\`\`\`

## 8. Primeiro Acesso

1. Acesse: `http://seu-dominio.com` ou `http://seu-ip:3000`
2. Faça login com as credenciais padrão:
   - Email: `admin@exemplo.com`
   - Senha: `admin123`
3. Configure sua empresa em **Configurações > Empresa**
4. **Importante**: Altere a senha padrão em **Admin > Perfil**

## Comandos Úteis

\`\`\`bash
# Ver logs do sistema
pm2 logs invoice-system

# Reiniciar aplicação
pm2 restart invoice-system

# Parar aplicação
pm2 stop invoice-system

# Ver status
pm2 status

# Atualizar código
cd /var/www/invoice-system
git pull origin main
npm install
npm run build
pm2 restart invoice-system
\`\`\`

## Troubleshooting

### Erro de conexão com o banco

\`\`\`bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar se o banco existe
psql -h localhost -U invoice_user -d invoice_system -c "SELECT version();"
\`\`\`

### Erro de permissões

\`\`\`bash
# Dar permissões ao usuário do banco
sudo -u postgres psql -d invoice_system
GRANT ALL ON SCHEMA public TO invoice_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO invoice_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO invoice_user;
\`\`\`

### Porta 3000 já em uso

\`\`\`bash
# Encontrar processo usando a porta
lsof -ti:3000

# Matar processo
lsof -ti:3000 | xargs kill -9
\`\`\`

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório do projeto.
