# Correção Final - Variáveis de Ambiente PM2

O problema é que o PM2 não carrega automaticamente o arquivo `.env.local`. 

## Solução Definitiva

Execute estes comandos no servidor:

\`\`\`bash
cd /var/www/invoice-system

# 1. Dar permissão de execução ao script
chmod +x load-env.sh

# 2. Parar e remover o processo atual
pm2 stop invoice-system
pm2 delete invoice-system

# 3. Rebuild do projeto (para aplicar as mudanças no postgres.ts)
npm run build

# 4. Iniciar com o novo ecosystem.config.js
pm2 start ecosystem.config.js

# 5. Salvar configuração
pm2 save

# 6. Ver os logs
pm2 logs invoice-system --lines 50
\`\`\`

## Verificar se funcionou

Os logs devem mostrar:
- `[v0] DATABASE_URL exists: true`
- `[v0] DATABASE_URL value: SET`
- `[v0] Creating PostgreSQL pool with URL: postgresql://invoice_user:****@localhost:5432/invoice_system`

Se ainda mostrar erros, use a solução alternativa abaixo.

## Solução Alternativa - Sem PM2

Se o PM2 continuar dando problemas, rode diretamente:

\`\`\`bash
# Parar PM2
pm2 stop invoice-system
pm2 delete invoice-system

# Rodar diretamente com o script
cd /var/www/invoice-system
./load-env.sh
\`\`\`

Ou use screen/tmux para manter rodando em background:

\`\`\`bash
# Instalar screen
apt install screen -y

# Iniciar sessão screen
screen -S invoice

# Dentro do screen, rodar
cd /var/www/invoice-system
./load-env.sh

# Pressionar Ctrl+A depois D para desanexar
# Para voltar: screen -r invoice
