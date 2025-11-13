# Guia de Instalação Completo - Sistema de Gestão NF-e

Este guia documenta todo o processo de instalação e configuração do sistema baseado na experiência real de setup em produção.

## 1. Requisitos do Sistema

- **Node.js**: v18.17 ou superior (testado com v18.17.0)
- **PostgreSQL**: v14 ou superior
- **PM2**: Para gerenciamento de processo (opcional mas recomendado)
- **Sistema Operacional**: Linux (Ubuntu/Debian recomendado)

## 2. Configuração do Banco de Dados PostgreSQL

### 2.1 Instalar PostgreSQL

\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
\`\`\`

### 2.2 Criar Usuário e Banco de Dados

\`\`\`bash
# Entrar no PostgreSQL como superuser
sudo -u postgres psql

# Dentro do PostgreSQL, executar:
CREATE USER invoice_user WITH PASSWORD 'sua_senha_segura';
CREATE DATABASE invoice_system;
GRANT ALL PRIVILEGES ON DATABASE invoice_system TO invoice_user;
\q
\`\`\`

### 2.3 Executar Scripts de Setup

\`\`\`bash
# Executar o script principal que cria todas as tabelas
psql -h localhost -U invoice_user -d invoice_system -f scripts/database-setup.sql

# Adicionar coluna logo_url para upload de logos
psql -h localhost -U invoice_user -d invoice_system -f scripts/add-logo-column.sql
\`\`\`

## 3. Configuração do Projeto

### 3.1 Clonar o Repositório

\`\`\`bash
cd /var/www
git clone https://github.com/seu-usuario/invoice-system.git
cd invoice-system
\`\`\`

### 3.2 Criar Arquivo de Ambiente

Criar arquivo `.env.local` na raiz do projeto:

\`\`\`bash
# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://invoice_user:sua_senha_segura@localhost:5432/invoice_system"
POSTGRES_URL="postgresql://invoice_user:sua_senha_segura@localhost:5432/invoice_system"

# URL do site (para redirecionamentos de email)
NEXT_PUBLIC_SITE_URL="http://seu-ip:3000"
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://seu-ip:3000"

# Vercel Blob (para upload de imagens - opcional)
BLOB_READ_WRITE_TOKEN="seu_token_aqui"
\`\`\`

### 3.3 Instalar Dependências

\`\`\`bash
npm install
\`\`\`

### 3.4 Build do Projeto

\`\`\`bash
npm run build
\`\`\`

## 4. Executar o Servidor

### Opção A: Direto com npm (desenvolvimento)

\`\`\`bash
npm start
\`\`\`

### Opção B: Com PM2 (produção recomendado)

\`\`\`bash
# Instalar PM2 globalmente se ainda não tiver
npm install -g pm2

# Iniciar o servidor
pm2 start ecosystem.config.js

# Salvar configuração para reinício automático
pm2 save
pm2 startup

# Ver logs
pm2 logs invoice-system

# Comandos úteis
pm2 restart invoice-system
pm2 stop invoice-system
pm2 delete invoice-system
\`\`\`

## 5. Primeiro Acesso

### 5.1 Acessar o Sistema

Abra o navegador e acesse: `http://seu-ip:3000`

### 5.2 Login Inicial

\`\`\`
Email: admin@exemplo.com
Senha: admin123
\`\`\`

**IMPORTANTE**: Altere a senha padrão após o primeiro login!

### 5.3 Configurar Empresa

1. Após o login, você será redirecionado para configurar sua empresa
2. Preencha os dados da empresa (Nome, CNPJ, Email, etc.)
3. Opcionalmente, faça upload do logo da empresa
4. Clique em "Salvar Empresa"

## 6. Solução de Problemas Comuns

### Erro: "getaddrinfo EAI_AGAIN"

**Causa**: Problema de DNS ao tentar conectar ao banco.

**Solução**: Verifique se o PostgreSQL está rodando e acessível:

\`\`\`bash
sudo systemctl status postgresql
sudo systemctl start postgresql
\`\`\`

### Erro: "column 'logo_url' does not exist"

**Causa**: Coluna não foi adicionada ao banco.

**Solução**: Execute o script:

\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system -f scripts/add-logo-column.sql
\`\`\`

### Erro: "Sistema não configurado"

**Causa**: Variáveis de ambiente não carregadas.

**Solução**: 
1. Verifique se o arquivo `.env.local` existe na raiz
2. Reinicie o servidor: `pm2 restart invoice-system`

### Erro: Build falha com erro de CSS

**Causa**: Importação problemática no globals.css

**Solução**: Já corrigido nas versões recentes. Se persistir, execute:

\`\`\`bash
rm -rf .next
npm run build
\`\`\`

### PM2 não inicia corretamente

**Causa**: Configuração incorreta do ecosystem.config.js

**Solução**: Use o arquivo ecosystem.config.js fornecido:

\`\`\`bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
\`\`\`

## 7. Atualização do Sistema

\`\`\`bash
cd /var/www/invoice-system

# Fazer backup
cp -r /var/www/invoice-system /var/www/invoice-system-backup-$(date +%Y%m%d)

# Atualizar código
git pull origin main

# Limpar cache e rebuild
rm -rf .next node_modules
npm install
npm run build

# Reiniciar
pm2 restart invoice-system
\`\`\`

## 8. Backup e Manutenção

### Backup do Banco de Dados

\`\`\`bash
# Backup completo
pg_dump -h localhost -U invoice_user invoice_system > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -h localhost -U invoice_user -d invoice_system < backup_20250113.sql
\`\`\`

### Logs do Sistema

\`\`\`bash
# Ver logs do PM2
pm2 logs invoice-system

# Ver logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
\`\`\`

## 9. Segurança

### Recomendações Importantes:

1. **Alterar senha padrão** do usuário admin
2. **Usar HTTPS** em produção (configure nginx como proxy reverso)
3. **Firewall**: Permitir apenas portas necessárias
4. **Backup regular** do banco de dados
5. **Atualizar dependências** regularmente: `npm audit fix`

## 10. Estrutura do Banco de Dados

### Tabelas Principais:

- `profiles`: Usuários do sistema
- `companies`: Dados das empresas
- `clients`: Clientes cadastrados
- `invoices`: Notas fiscais emitidas
- `payments`: Pagamentos recebidos
- `payment_methods`: Métodos de pagamento disponíveis
- `bank_statements`: Extratos bancários importados

### Usuário Padrão:

\`\`\`sql
-- Email: admin@exemplo.com
-- Senha (hash bcrypt): admin123
-- Role: admin
-- Company: Exemplo Empresa LTDA
\`\`\`

## Suporte

Para problemas ou dúvidas, consulte:
- README.md
- Logs do sistema: `pm2 logs invoice-system`
- Logs do PostgreSQL: `/var/log/postgresql/`
