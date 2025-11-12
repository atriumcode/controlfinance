# Configuração PM2 para Sistema de Notas Fiscais

## Passo 1: Criar o arquivo .env.local

No servidor, execute:

\`\`\`bash
cd /var/www/invoice-system
nano .env.local
\`\`\`

Cole o seguinte conteúdo (substitua os valores conforme necessário):

\`\`\`env
DATABASE_URL="postgresql://invoice_user:SuaSenhaSegura123!@localhost:5432/invoice_system"
NEXT_PUBLIC_SITE_URL="http://seu-dominio.com"
SESSION_SECRET="sua-chave-secreta-aleatoria-32-caracteres"
\`\`\`

**Para gerar uma SESSION_SECRET segura:**
\`\`\`bash
openssl rand -base64 32
\`\`\`

## Passo 2: Configurar Permissões

\`\`\`bash
chmod 600 .env.local
chown expert:expert .env.local
\`\`\`

## Passo 3: Parar o PM2 atual

\`\`\`bash
pm2 stop invoice-system
pm2 delete invoice-system
\`\`\`

## Passo 4: Iniciar com PM2 usando ecosystem.config.js

\`\`\`bash
cd /var/www/invoice-system
pm2 start ecosystem.config.js
pm2 save
\`\`\`

## Passo 5: Verificar logs

\`\`\`bash
pm2 logs invoice-system
\`\`\`

Você deve ver:
- ✓ Next.js iniciado
- Sem erros de "getaddrinfo EAI_AGAIN"

## Passo 6: Testar a aplicação

Abra no navegador:
- http://localhost:3000
- ou http://seu-dominio.com

**Login padrão:**
- Email: admin@exemplo.com
- Senha: admin123

## Comandos úteis do PM2

\`\`\`bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs invoice-system

# Reiniciar
pm2 restart invoice-system

# Parar
pm2 stop invoice-system

# Ver informações detalhadas
pm2 show invoice-system
\`\`\`

## Troubleshooting

### Erro: "getaddrinfo EAI_AGAIN invoice_user"
**Causa:** Arquivo .env.local não existe ou não está sendo carregado.

**Solução:**
\`\`\`bash
# Verificar se o arquivo existe
cat /var/www/invoice-system/.env.local

# Se não existir, criar conforme Passo 1
\`\`\`

### Erro: "connect ECONNREFUSED"
**Causa:** PostgreSQL não está rodando.

**Solução:**
\`\`\`bash
sudo systemctl start postgresql
sudo systemctl status postgresql
\`\`\`

### Erro: "password authentication failed"
**Causa:** Senha incorreta no .env.local.

**Solução:**
Verifique a senha no arquivo .env.local e confirme que é a mesma usada ao criar o usuário invoice_user.
\`\`\`bash
# Resetar senha se necessário
sudo -u postgres psql -c "ALTER USER invoice_user WITH PASSWORD 'NovaSenha123!';"
\`\`\`

### Variáveis de ambiente não são carregadas
**Causa:** PM2 não carrega automaticamente .env.local do Next.js.

**Solução:** Use o ecosystem.config.js fornecido ou carregue as variáveis manualmente:
\`\`\`bash
pm2 stop invoice-system
pm2 delete invoice-system
cd /var/www/invoice-system
export $(cat .env.local | xargs)
pm2 start npm --name "invoice-system" -- start
\`\`\`
\`\`\`
