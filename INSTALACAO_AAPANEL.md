# 📦 Instalação do Sistema de Notas Fiscais no aaPanel

Guia completo para instalar e configurar o sistema de notas fiscais em um servidor Ubuntu usando o aaPanel.

---

## 📋 Pré-requisitos

- Servidor Ubuntu 20.04 ou 22.04 ou 24.04
- Mínimo 2GB RAM
- Acesso root via SSH
- Domínio apontando para o IP do servidor

---

## 🚀 Passo 1: Instalar o aaPanel

### 1.1. Conectar ao servidor via SSH

\`\`\`bash
ssh root@seu-servidor-ip
\`\`\`

### 1.2. Instalar o aaPanel

\`\`\`bash
# Para Ubuntu/Debian
wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && sudo bash install.sh aapanel
\`\`\`

**Aguarde a instalação (5-10 minutos)**

Ao final, você verá:
\`\`\`
==================================================================
Congratulations! Installed successfully!
==================================================================
aaPanel Internet Address: http://SEU_IP:7800/xxxxxxxx
aaPanel Internal Address: http://127.0.0.1:7800/xxxxxxxx
username: xxxxxxxx
password: xxxxxxxx
==================================================================
\`\`\`

**⚠️ IMPORTANTE: Anote o endereço, usuário e senha!**

### 1.3. Acessar o aaPanel

Abra no navegador: `http://SEU_IP:7800/xxxxxxxx`

Faça login com as credenciais fornecidas.

---

## 🔧 Passo 2: Configurar o aaPanel

### 2.1. Mudar idioma (opcional)

No canto superior direito, clique no ícone da bandeira e selecione seu idioma preferido.

### 2.2. Instalar componentes necessários

Ao fazer login pela primeira vez, o aaPanel sugere instalar o ambiente LNMP/LAMP.

**Selecione as seguintes opções:**

- ✅ **Nginx** (versão mais recente)
- ✅ **PostgreSQL 16** (NÃO MySQL)
- ✅ **PHP 8.1** (apenas se pretende usar outras aplicações PHP)
- ✅ **phpPgAdmin** (para gerenciar PostgreSQL via interface)

Clique em **"One-click Install"** e aguarde a instalação (10-20 minutos).

### 2.3. Instalar Node.js e PM2

No menu lateral, vá em **App Store** → busque por **"Node.js"**

- Clique em **Install**
- Selecione a versão **v20.x** (LTS)
- Aguarde a instalação

Após instalar Node.js, instale o **PM2**:

No terminal do aaPanel (ou via SSH):

\`\`\`bash
npm install -g pm2
\`\`\`

---

## 🗄️ Passo 3: Configurar PostgreSQL

### 3.1. Acessar PostgreSQL Manager

No aaPanel, vá em: **Database** → **PostgreSQL**

### 3.2. Criar usuário e banco de dados

Clique em **"Add Database"**

**Configurações:**
- **Database Name**: `invoice_system`
- **Username**: `invoice_user`
- **Password**: Crie uma senha forte (anote!)
- **Access Permission**: `Local server`

Clique em **Submit**

### 3.3. Configurar acesso local

Via SSH, edite o arquivo de configuração:

\`\`\`bash
# Encontrar a versão instalada
ls /www/server/pgsql/

# Editar pg_hba.conf (ajuste a versão se necessário)
nano /www/server/pgsql/data/pg_hba.conf
\`\`\`

Adicione no final do arquivo:

\`\`\`conf
# Permitir conexões locais
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
\`\`\`

Salve (Ctrl+O, Enter, Ctrl+X) e reinicie o PostgreSQL:

\`\`\`bash
# No aaPanel, vá em Database → PostgreSQL → clique em "Restart"
\`\`\`

### 3.4. Testar conexão

\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system
# Digite a senha quando solicitado
\`\`\`

Se conectar com sucesso, digite `\q` para sair.

---

## 📥 Passo 4: Fazer Deploy do Sistema

### 4.1. Criar diretório do projeto

\`\`\`bash
mkdir -p /www/wwwroot/invoice-system
cd /www/wwwroot/invoice-system
\`\`\`

### 4.2. Clonar o projeto (ou fazer upload)

**Opção A: Via Git (se você tem o código no GitHub)**

\`\`\`bash
git clone https://github.com/seu-usuario/invoice-system.git .
\`\`\`

**Opção B: Via Upload no aaPanel**

1. No aaPanel, vá em **Files**
2. Navegue até `/www/wwwroot/`
3. Crie a pasta `invoice-system`
4. Faça upload do arquivo ZIP do projeto
5. Clique com botão direito → **Extract**

### 4.3. Configurar variáveis de ambiente

\`\`\`bash
cd /www/wwwroot/invoice-system
nano .env.local
\`\`\`

Cole e configure:

\`\`\`env
# Database
DATABASE_URL="postgresql://invoice_user:SUA_SENHA_AQUI@localhost:5432/invoice_system"

# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL="https://seu-dominio.com"

# Session Secret (gere uma chave aleatória de 32+ caracteres)
SESSION_SECRET="gere-uma-chave-aleatoria-muito-segura-aqui-minimo-32-chars"

# Vercel Blob (se for usar upload de arquivos)
BLOB_READ_WRITE_TOKEN="seu-token-do-vercel-blob"
\`\`\`

**Para gerar SESSION_SECRET:**

\`\`\`bash
openssl rand -base64 32
\`\`\`

Salve o arquivo (Ctrl+O, Enter, Ctrl+X)

### 4.4. Instalar dependências

\`\`\`bash
cd /www/wwwroot/invoice-system
npm install
\`\`\`

### 4.5. Executar scripts SQL

\`\`\`bash
# Executar o script de setup completo
psql -h localhost -U invoice_user -d invoice_system -f scripts/complete-postgresql-setup.sql
\`\`\`

Digite a senha quando solicitado.

**Verificar se as tabelas foram criadas:**

\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system -c "\dt"
\`\`\`

Você deve ver as tabelas: companies, profiles, sessions, clients, invoices, invoice_items, payments, audit_logs, import_history.

### 4.6. Build do projeto

\`\`\`bash
cd /www/wwwroot/invoice-system
npm run build
\`\`\`

Aguarde o build finalizar (pode demorar alguns minutos).

### 4.7. Iniciar com PM2

\`\`\`bash
pm2 start npm --name "invoice-system" -- start
pm2 save
pm2 startup
\`\`\`

**Verificar se está rodando:**

\`\`\`bash
pm2 status
pm2 logs invoice-system
\`\`\`

O sistema deve estar rodando na porta 3000.

---

## 🌐 Passo 5: Configurar Nginx no aaPanel

### 5.1. Criar novo site

No aaPanel, vá em **Website** → **Add Site**

**Configurações:**
- **Domain**: `seu-dominio.com` (e `www.seu-dominio.com` se quiser)
- **Document Root**: `/www/wwwroot/invoice-system`
- **PHP Version**: `Pure static` (não precisa de PHP)
- **Create Database**: `No` (já criamos)

Clique em **Submit**

### 5.2. Configurar Reverse Proxy

Clique no nome do site criado → aba **"Reverse Proxy"**

**Configurações:**
- **Target URL**: `http://127.0.0.1:3000`
- **Enable Proxy**: `Yes`
- **Cache**: `No` (para aplicações dinâmicas)

Clique em **Submit**

### 5.3. Configurar SSL (HTTPS)

Clique no nome do site → aba **"SSL"**

**Opção A: Let's Encrypt (Grátis e Recomendado)**

1. Selecione **"Let's Encrypt"**
2. Marque seu domínio
3. Clique em **"Apply"**
4. Aguarde a geração do certificado
5. Marque **"Force HTTPS"**

**Opção B: Se já tem certificado**

1. Selecione **"Other Certificate"**
2. Cole o certificado e a chave privada
3. Clique em **"Save"**
4. Marque **"Force HTTPS"**

### 5.4. Configuração adicional do Nginx

Clique no site → aba **"Config Files"**

Adicione dentro do bloco `location /`:

\`\`\`nginx
# Timeout para operações longas
proxy_connect_timeout 600;
proxy_send_timeout 600;
proxy_read_timeout 600;
send_timeout 600;

# Headers importantes para Next.js
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# WebSocket support (se necessário)
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
\`\`\`

Clique em **Save** e depois em **Reload Config**.

---

## ✅ Passo 6: Verificar Instalação

### 6.1. Acessar o sistema

Abra o navegador: `https://seu-dominio.com`

Você deve ver a página de login do sistema.

### 6.2. Fazer primeiro login

Use as credenciais padrão criadas no script SQL:

- **Email**: `admin@exemplo.com`
- **Senha**: `admin123`

**⚠️ IMPORTANTE: Mude a senha imediatamente após o primeiro login!**

### 6.3. Configurar empresa

1. Vá em **Configurações** no menu
2. Preencha os dados da sua empresa
3. Salve as configurações

---

## 🔧 Manutenção e Comandos Úteis

### Ver logs do sistema

\`\`\`bash
pm2 logs invoice-system
\`\`\`

### Reiniciar o sistema

\`\`\`bash
pm2 restart invoice-system
\`\`\`

### Parar o sistema

\`\`\`bash
pm2 stop invoice-system
\`\`\`

### Atualizar o sistema (após mudanças no código)

\`\`\`bash
cd /www/wwwroot/invoice-system
git pull  # se usar Git
npm install  # se houver novas dependências
npm run build
pm2 restart invoice-system
\`\`\`

### Backup do banco de dados

\`\`\`bash
# Criar backup
pg_dump -h localhost -U invoice_user invoice_system > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -h localhost -U invoice_user -d invoice_system < backup_20250103.sql
\`\`\`

### Monitorar recursos

\`\`\`bash
pm2 monit
\`\`\`

---

## 🐛 Troubleshooting

### Sistema não inicia

\`\`\`bash
# Ver logs de erro
pm2 logs invoice-system --err

# Verificar se a porta 3000 está livre
netstat -tlnp | grep 3000

# Se a porta estiver ocupada, matar o processo
kill -9 $(lsof -t -i:3000)
pm2 restart invoice-system
\`\`\`

### Erro de conexão com banco de dados

\`\`\`bash
# Testar conexão
psql -h localhost -U invoice_user -d invoice_system

# Verificar se PostgreSQL está rodando
systemctl status postgresql
# Ou no aaPanel: Database → PostgreSQL → Status
\`\`\`

### Erro 502 Bad Gateway

\`\`\`bash
# Verificar se o sistema está rodando
pm2 status

# Reiniciar Nginx no aaPanel
# Website → clique no site → Settings → Reload
\`\`\`

### Permissões de arquivo

\`\`\`bash
# Ajustar permissões
cd /www/wwwroot/invoice-system
chown -R www:www .
chmod -R 755 .
\`\`\`

---

## 🔒 Segurança

### Configurar Firewall no aaPanel

No aaPanel, vá em **Security**:

- ✅ Mantenha porta **7800** (aaPanel)
- ✅ Mantenha porta **80** (HTTP)
- ✅ Mantenha porta **443** (HTTPS)
- ✅ Mantenha porta **22** (SSH)
- ❌ **Bloqueie porta 3000** (aplicação deve ser acessada apenas via Nginx)
- ❌ **Bloqueie porta 5432** (PostgreSQL não deve ser exposto)

### Mudar senha do aaPanel

Security → aaPanel Admin → Change Password

### Habilitar autenticação de dois fatores

Security → Two-Factor Authentication → Enable

### Configurar backups automáticos

No aaPanel, vá em **Cron**:

**Backup do banco de dados (diário às 2h)**

\`\`\`bash
0 2 * * * pg_dump -h localhost -U invoice_user invoice_system > /www/backup/db_$(date +\%Y\%m\%d).sql
\`\`\`

**Backup dos arquivos (semanal aos domingos às 3h)**

\`\`\`bash
0 3 * * 0 tar -czf /www/backup/files_$(date +\%Y\%m\%d).tar.gz /www/wwwroot/invoice-system
\`\`\`

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs invoice-system`
2. Verifique o status: `pm2 status`
3. Verifique os logs do Nginx no aaPanel: Files → `/www/wwwlogs/`
4. Verifique os logs do PostgreSQL: Files → `/www/server/pgsql/data/log/`

---

## 🎉 Conclusão

Seu sistema de notas fiscais está instalado e rodando! 

**Próximos passos:**
1. ✅ Mudar senha do usuário admin
2. ✅ Configurar dados da empresa
3. ✅ Cadastrar clientes
4. ✅ Emitir primeira nota fiscal
5. ✅ Configurar backups automáticos

Bom uso do sistema! 🚀
