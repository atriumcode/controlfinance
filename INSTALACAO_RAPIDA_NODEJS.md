# Instalação Rápida - Node.js 20 LTS

## Passo a Passo Completo

### 1. Atualizar Node.js para versão 20

Execute os comandos abaixo no terminal SSH:

\`\`\`bash
# Instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Carregar NVM no terminal atual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar instalação
node -v  # Deve mostrar v20.x.x
npm -v   # Deve mostrar v10.x.x ou superior
\`\`\`

### 2. Preparar Diretório do Projeto

\`\`\`bash
# Navegar para o diretório
cd /var/www/invoice-system

# Limpar instalação anterior
rm -rf node_modules package-lock.json

# Limpar cache do npm
npm cache clean --force

# Corrigir permissões (se necessário)
sudo chown -R $USER:$USER /var/www/invoice-system
\`\`\`

### 3. Instalar Dependências

\`\`\`bash
# Instalar todas as dependências
npm install

# Se encontrar erros de permissão, tente:
npm install --unsafe-perm
\`\`\`

### 4. Configurar Variáveis de Ambiente

\`\`\`bash
# Criar arquivo .env.local
nano .env.local
\`\`\`

Cole o seguinte conteúdo:

\`\`\`env
# Database Connection
DATABASE_URL="postgresql://invoice_user:SuaSenhaSegura123!@localhost:5432/invoice_system"

# Application URL
NEXT_PUBLIC_SITE_URL="https://seu-dominio.com"

# Session Secret (gere uma chave aleatória)
SESSION_SECRET="sua-chave-secreta-minimo-32-caracteres-aqui"

# Blob Storage (opcional - para upload de arquivos)
BLOB_READ_WRITE_TOKEN="seu-token-vercel-blob"
\`\`\`

Para gerar uma SESSION_SECRET segura:
\`\`\`bash
openssl rand -base64 32
\`\`\`

Salve com `Ctrl+O`, Enter, `Ctrl+X`

### 5. Build e Iniciar

\`\`\`bash
# Build do projeto
npm run build

# Testar localmente
npm start

# A aplicação estará rodando em http://localhost:3000
\`\`\`

### 6. Configurar PM2 para Produção (Recomendado)

\`\`\`bash
# Instalar PM2 globalmente
npm install -g pm2

# Parar processo anterior (se existir)
pm2 stop invoice-system
pm2 delete invoice-system

# Iniciar aplicação
pm2 start npm --name "invoice-system" -- start

# Configurar para iniciar automaticamente
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs invoice-system
\`\`\`

### 7. Configurar Nginx como Proxy Reverso

Crie um novo site no aaPanel:

1. Acesse aaPanel → Website → Add site
2. Domain: `seu-dominio.com`
3. Após criar, clique em Settings → Reverse Proxy
4. Configure:

\`\`\`nginx
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
\`\`\`

### 8. Configurar SSL (Let's Encrypt)

No aaPanel:
1. Vá em Website → seu-dominio.com → SSL
2. Selecione Let's Encrypt
3. Clique em Apply

## Login Inicial

Após a instalação:

- URL: `https://seu-dominio.com`
- Email: `admin@exemplo.com`
- Senha: `admin123`

**IMPORTANTE:** Altere a senha após o primeiro login!

## Comandos Úteis PM2

\`\`\`bash
# Ver logs em tempo real
pm2 logs invoice-system

# Reiniciar aplicação
pm2 restart invoice-system

# Parar aplicação
pm2 stop invoice-system

# Verificar uso de recursos
pm2 monit

# Listar processos
pm2 list
\`\`\`

## Troubleshooting

### Erro: "nvm: command not found"
\`\`\`bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
\`\`\`

### Erro: "EACCES: permission denied"
\`\`\`bash
sudo chown -R $USER:$USER /var/www/invoice-system
sudo chmod -R 755 /var/www/invoice-system
\`\`\`

### Erro: "Cannot connect to database"
Verifique se o PostgreSQL está rodando:
\`\`\`bash
sudo systemctl status postgresql
sudo systemctl start postgresql
\`\`\`

### Porta 3000 já em uso
\`\`\`bash
# Encontrar processo na porta 3000
sudo lsof -i :3000

# Matar processo (substitua PID pelo número mostrado)
kill -9 PID
\`\`\`

## Atualizar o Sistema

\`\`\`bash
cd /var/www/invoice-system

# Baixar atualizações do Git
git pull origin main

# Reinstalar dependências (se necessário)
npm install

# Rebuild
npm run build

# Reiniciar com PM2
pm2 restart invoice-system
\`\`\`

## Suporte

Em caso de problemas:
1. Verifique os logs: `pm2 logs invoice-system`
2. Verifique o status do banco: `sudo systemctl status postgresql`
3. Verifique as variáveis de ambiente no `.env.local`
4. Revise a documentação completa em `POSTGRESQL_SETUP.md`
