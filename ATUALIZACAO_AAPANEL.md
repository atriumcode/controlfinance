# 🔄 Como Atualizar o Sistema no aaPanel

Guia rápido para atualizar o sistema de notas fiscais já instalado.

---

## 📥 Atualização via Git (Recomendado)

Se você clonou o projeto via Git:

\`\`\`bash
# 1. Navegar até o diretório
cd /www/wwwroot/invoice-system

# 2. Fazer backup do .env.local
cp .env.local .env.local.backup

# 3. Baixar atualizações
git pull origin main

# 4. Instalar novas dependências (se houver)
npm install

# 5. Executar novos scripts SQL (se houver)
# Verifique na pasta scripts/ se há arquivos novos
ls -la scripts/

# 6. Fazer build
npm run build

# 7. Reiniciar aplicação
pm2 restart invoice-system

# 8. Verificar logs
pm2 logs invoice-system
\`\`\`

---

## 📤 Atualização via Upload Manual

Se você faz upload dos arquivos manualmente:

### Passo 1: Fazer backup

\`\`\`bash
# Backup do sistema atual
cd /www/wwwroot/
tar -czf invoice-system-backup-$(date +%Y%m%d).tar.gz invoice-system/

# Backup do banco de dados
pg_dump -h localhost -U invoice_user invoice_system > db-backup-$(date +%Y%m%d).sql
\`\`\`

### Passo 2: Parar aplicação

\`\`\`bash
pm2 stop invoice-system
\`\`\`

### Passo 3: Upload dos novos arquivos

1. No aaPanel, vá em **Files**
2. Navegue até `/www/wwwroot/invoice-system`
3. **NÃO DELETE o arquivo .env.local**
4. Faça upload do novo ZIP
5. Extract e sobrescreva os arquivos

### Passo 4: Restaurar configurações

\`\`\`bash
cd /www/wwwroot/invoice-system

# Verificar se .env.local existe
cat .env.local

# Se foi apagado, restaurar do backup
# cp /caminho/do/backup/.env.local .env.local
\`\`\`

### Passo 5: Instalar e buildar

\`\`\`bash
cd /www/wwwroot/invoice-system
npm install
npm run build
\`\`\`

### Passo 6: Executar novos scripts SQL (se necessário)

\`\`\`bash
# Verificar se há novos scripts
ls -la scripts/

# Executar scripts novos (exemplo)
psql -h localhost -U invoice_user -d invoice_system -f scripts/novo-script.sql
\`\`\`

### Passo 7: Reiniciar

\`\`\`bash
pm2 restart invoice-system
pm2 logs invoice-system
\`\`\`

---

## 🗄️ Atualização do Banco de Dados

Se a atualização incluir mudanças no banco:

### Verificar migrations disponíveis

\`\`\`bash
ls -la scripts/
\`\`\`

### Executar migrations na ordem

\`\`\`bash
cd /www/wwwroot/invoice-system

# Executar cada script novo na ordem
psql -h localhost -U invoice_user -d invoice_system -f scripts/001-nova-feature.sql
psql -h localhost -U invoice_user -d invoice_system -f scripts/002-outra-feature.sql
\`\`\`

### Verificar se aplicou corretamente

\`\`\`bash
psql -h localhost -U invoice_user -d invoice_system

# Dentro do psql:
\dt  # Listar tabelas
\d nome_da_tabela  # Ver estrutura de uma tabela
\q  # Sair
\`\`\`

---

## ✅ Checklist Pós-Atualização

Após atualizar, verifique:

- [ ] Sistema inicia sem erros: `pm2 logs invoice-system`
- [ ] Site acessível: `https://seu-dominio.com`
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Listagem de notas funciona
- [ ] Criar nova nota funciona
- [ ] Relatórios funcionam

---

## 🔙 Reverter Atualização (se necessário)

Se algo der errado:

\`\`\`bash
# 1. Parar aplicação
pm2 stop invoice-system

# 2. Restaurar arquivos
cd /www/wwwroot/
rm -rf invoice-system
tar -xzf invoice-system-backup-20250103.tar.gz

# 3. Restaurar banco de dados
psql -h localhost -U invoice_user -d invoice_system < db-backup-20250103.sql

# 4. Reiniciar
pm2 restart invoice-system
\`\`\`

---

## 📞 Problemas Comuns

### Erro: "Module not found"

\`\`\`bash
cd /www/wwwroot/invoice-system
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart invoice-system
\`\`\`

### Erro: "Database connection failed"

Verifique se o PostgreSQL está rodando e se as credenciais em `.env.local` estão corretas.

### Erro: "Port 3000 already in use"

\`\`\`bash
pm2 stop invoice-system
pm2 start invoice-system
\`\`\`

---

## 🎯 Dicas

- Sempre faça backup antes de atualizar
- Teste em um ambiente de desenvolvimento primeiro, se possível
- Mantenha um registro das versões instaladas
- Documente qualquer customização que você fez

---

Atualização concluída! ✨
