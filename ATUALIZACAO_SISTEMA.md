# Como Atualizar o Sistema

Este guia explica como atualizar o sistema após fazer pull das últimas mudanças do repositório.

## Passo 1: Parar o Sistema

\`\`\`bash
pm2 stop invoice-system
\`\`\`

## Passo 2: Atualizar o Código

\`\`\`bash
cd /var/www/invoice-system
git pull origin main
\`\`\`

## Passo 3: Instalar Dependências

\`\`\`bash
npm install
\`\`\`

## Passo 4: Rebuild da Aplicação

\`\`\`bash
npm run build
\`\`\`

## Passo 5: Reiniciar o Sistema

\`\`\`bash
pm2 restart invoice-system
pm2 logs invoice-system
\`\`\`

## Troubleshooting

### Erro: "Module not found"

Execute:
\`\`\`bash
rm -rf .next node_modules
npm install
npm run build
pm2 restart invoice-system
\`\`\`

### Erro: "Database connection failed"

Verifique se o PostgreSQL está rodando:
\`\`\`bash
sudo systemctl status postgresql
\`\`\`

Teste a conexão:
\`\`\`bash
psql -U invoice_user -d invoice_system -c "SELECT 1"
\`\`\`

### Erro: "Port 3000 already in use"

\`\`\`bash
pm2 delete invoice-system
sudo lsof -i :3000
# Mate o processo se necessário
pm2 start ecosystem.config.js
\`\`\`
\`\`\`
