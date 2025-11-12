# Correção do Erro de Instalação do npm

## Problema
O erro `fatal error: libpq-fe.h: No such file or directory` ocorre porque o pacote `libpq` precisa dos headers de desenvolvimento do PostgreSQL.

## Solução Rápida (Recomendada)

### Opção 1: Instalar sem dependências opcionais
\`\`\`bash
cd /var/www/invoice-system

# Limpar instalações anteriores
rm -rf node_modules package-lock.json

# Instalar sem dependências opcionais (mais rápido)
npm install --no-optional
\`\`\`

### Opção 2: Instalar os headers do PostgreSQL
Se preferir ter todas as dependências:

\`\`\`bash
# Instalar headers de desenvolvimento do PostgreSQL
sudo apt-get update
sudo apt-get install -y libpq-dev postgresql-server-dev-all

# Limpar e reinstalar
cd /var/www/invoice-system
rm -rf node_modules package-lock.json
npm install
\`\`\`

## Após a instalação bem-sucedida

### 1. Configurar variáveis de ambiente
\`\`\`bash
nano .env.local
\`\`\`

Adicione:
\`\`\`env
DATABASE_URL="postgresql://invoice_user:SuaSenhaSegura123!@localhost:5432/invoice_system"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
SESSION_SECRET="cole-aqui-resultado-do-comando-abaixo"
\`\`\`

Gerar SESSION_SECRET:
\`\`\`bash
openssl rand -base64 32
\`\`\`

### 2. Build e iniciar
\`\`\`bash
# Build do projeto
npm run build

# Iniciar em desenvolvimento
npm run dev

# OU iniciar em produção
npm start
\`\`\`

### 3. Configurar PM2 para produção
\`\`\`bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "invoice-system" -- start

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
\`\`\`

### 4. Configurar Nginx (se necessário)

Criar arquivo de configuração:
\`\`\`bash
sudo nano /etc/nginx/sites-available/invoice-system
\`\`\`

Adicione:
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

Ativar site:
\`\`\`bash
sudo ln -s /etc/nginx/sites-available/invoice-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

## Acesso Inicial

Após tudo configurado, acesse:
- URL: `http://seu-dominio.com` ou `http://localhost:3000`
- Email: `admin@exemplo.com`
- Senha: `admin123`

**IMPORTANTE:** Altere a senha do admin imediatamente após o primeiro login!

## Troubleshooting

### Se o build falhar com erros de TypeScript
\`\`\`bash
# Verificar versões
node -v  # Deve ser >= 18.17.0
npm -v   # Deve ser >= 9.0.0

# Limpar cache
npm cache clean --force
rm -rf node_modules .next package-lock.json
npm install --no-optional
npm run build
\`\`\`

### Se a aplicação não conectar ao banco
\`\`\`bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão manualmente
psql -h localhost -U invoice_user -d invoice_system
\`\`\`

### Verificar logs do PM2
\`\`\`bash
pm2 logs invoice-system
pm2 status
