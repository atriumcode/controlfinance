# Teste de Variáveis de Ambiente

Execute estes comandos no servidor para diagnosticar o problema:

## 1. Verificar se o arquivo .env.local existe e está correto

\`\`\`bash
cd /var/www/invoice-system
cat .env.local
\`\`\`

Deve mostrar:
\`\`\`
DATABASE_URL="postgresql://invoice_user:SuaSenha@localhost:5432/invoice_system"
NEXT_PUBLIC_SITE_URL="http://seu-ip:3000"
SESSION_SECRET="sua-chave-32-caracteres"
\`\`\`

## 2. Testar a conexão diretamente com psql

\`\`\`bash
# Usar a URL completa para testar
psql "postgresql://invoice_user:#NetCom1978@localhost:5432/invoice_system" -c "SELECT COUNT(*) FROM profiles;"
\`\`\`

Se funcionar, o problema é apenas o carregamento das variáveis no Node.js.

## 3. Criar arquivo .env.local correto

\`\`\`bash
cd /var/www/invoice-system

# Criar novo .env.local
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://invoice_user:#NetCom1978@localhost:5432/invoice_system"
NEXT_PUBLIC_SITE_URL="http://172.16.35.118:3000"
SESSION_SECRET="hX5xxumpKWKGBp9KwRGAwLCptsVY9VxhBqg2uV71Tiw="
EOF

chmod 600 .env.local
\`\`\`

## 4. Rebuild e reiniciar

\`\`\`bash
npm run build
npm start
\`\`\`

Se aparecer os logs "[v0] Loading environment from:" e "[v0] DATABASE_URL exists: true", o problema foi resolvido.

## 5. Se ainda não funcionar, teste com variável inline

\`\`\`bash
DATABASE_URL="postgresql://invoice_user:#NetCom1978@localhost:5432/invoice_system" \
SESSION_SECRET="hX5xxumpKWKGBp9KwRGAwLCptsVY9VxhBqg2uV71Tiw=" \
NEXT_PUBLIC_SITE_URL="http://172.16.35.118:3000" \
npm start
\`\`\`

Se funcionar com inline mas não com .env.local, o problema é o formato do arquivo.
