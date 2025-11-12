# Guia de Instalação - Sistema de Gestão de Notas Fiscais

Sistema completo de gestão de notas fiscais com PostgreSQL puro.

## Pré-requisitos

- Node.js 18.17 ou superior
- PostgreSQL 12 ou superior
- npm ou yarn

## Passo 1: Instalar Node.js 20 LTS (Recomendado)

\`\`\`bash
# Instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar o shell
source ~/.bashrc

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x
\`\`\`

## Passo 2: Configurar PostgreSQL

\`\`\`bash
# Instalar PostgreSQL (se ainda não tiver)
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Acessar PostgreSQL como superusuário
sudo -u postgres psql
\`\`\`

### Criar Banco de Dados e Usuário

\`\`\`sql
-- No psql, execute:
CREATE DATABASE invoice_system;
CREATE USER invoice_user WITH ENCRYPTED PASSWORD 'SuaSenhaSegura123!';
GRANT ALL PRIVILEGES ON DATABASE invoice_system TO invoice_user;
\q
\`\`\`

### Executar Script de Instalação

\`\`\`bash
# Executar o script SQL
psql -U invoice_user -d invoice_system -f database-setup.sql

# Verificar se as tabelas foram criadas
psql -U invoice_user -d invoice_system -c "\dt"
\`\`\`

Você deve ver 9 tabelas criadas:
- companies
- profiles
- sessions
- clients
- invoices
- invoice_items
- payments
- audit_logs
- import_history

## Passo 3: Clonar e Configurar o Projeto

\`\`\`bash
# Clonar o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git invoice-system
cd invoice-system

# Instalar dependências
npm install
\`\`\`

## Passo 4: Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

\`\`\`bash
nano .env.local
\`\`\`

Cole o seguinte conteúdo (ajuste os valores conforme necessário):

\`\`\`env
# Database Connection
DATABASE_URL="postgresql://invoice_user:SuaSenhaSegura123!@localhost:5432/invoice_system"

# Application
NEXT_PUBLIC_SITE_URL="http://seu-ip-ou-dominio:3000"
NODE_ENV="production"

# Session Secret (gere uma chave aleatória)
SESSION_SECRET="sua-chave-secreta-aleatoria-32-caracteres-minimo"
\`\`\`

### Gerar SESSION_SECRET

\`\`\`bash
openssl rand -base64 32
\`\`\`

**IMPORTANTE**: Se sua senha do PostgreSQL contiver caracteres especiais como `#`, `@`, `&`, você precisa URL-encode eles:
- `#` = `%23`
- `@` = `%40`
- `&` = `%26`
- `:` = `%3A`

Exemplo:
\`\`\`
Senha: #NetCom1978
DATABASE_URL: postgresql://invoice_user:%23NetCom1978@localhost:5432/invoice_system
\`\`\`

## Passo 5: Build e Iniciar o Sistema

\`\`\`bash
# Build da aplicação
npm run build

# Iniciar em modo desenvolvimento (para testes)
npm run dev

# OU iniciar em modo produção
npm start
\`\`\`

O sistema estará disponível em `http://localhost:3000`

## Passo 6: Configurar PM2 (Produção)

Para rodar o sistema em background e iniciar automaticamente:

\`\`\`bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
require('dotenv').config({ path: '.env.local' })

module.exports = {
  apps: [{
    name: 'invoice-system',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/invoice-system',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      SESSION_SECRET: process.env.SESSION_SECRET
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

# Instalar dotenv
npm install dotenv

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar inicialização automática
pm2 startup
# Execute o comando que o PM2 mostrar

# Ver logs
pm2 logs invoice-system

# Ver status
pm2 status
\`\`\`

## Passo 7: Configurar Nginx (Opcional)

Se quiser acessar via domínio ao invés de IP:porta:

\`\`\`bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/invoice-system
\`\`\`

Cole:

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

\`\`\`bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/invoice-system /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
\`\`\`

## Login Inicial

Após a instalação, acesse o sistema e faça login com:

- **Email**: `admin@exemplo.com`
- **Senha**: `admin123`

**IMPORTANTE**: Altere a senha padrão imediatamente após o primeiro acesso!

## Comandos Úteis

\`\`\`bash
# Ver logs do PM2
pm2 logs invoice-system

# Reiniciar aplicação
pm2 restart invoice-system

# Parar aplicação
pm2 stop invoice-system

# Ver status
pm2 status

# Remover da lista do PM2
pm2 delete invoice-system

# Atualizar código
cd /var/www/invoice-system
git pull
npm install
npm run build
pm2 restart invoice-system
\`\`\`

## Troubleshooting

### Erro: "getaddrinfo EAI_AGAIN"

Isso significa que a `DATABASE_URL` não está sendo carregada. Verifique:

1. O arquivo `.env.local` existe e está na raiz do projeto
2. As variáveis estão sem aspas extras ou espaços
3. A senha está URL-encoded se tiver caracteres especiais

### Erro: "column does not exist"

Execute o script SQL novamente:

\`\`\`bash
psql -U invoice_user -d invoice_system -f database-setup.sql
\`\`\`

### Sistema não inicia

Verifique os logs:

\`\`\`bash
pm2 logs invoice-system --lines 100
\`\`\`

### Porta 3000 já em uso

Pare outros processos ou mude a porta no `.env.local`:

\`\`\`bash
# Encontrar processo usando a porta 3000
sudo lsof -i :3000

# Matar processo
sudo kill -9 PID
\`\`\`

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório do projeto.
