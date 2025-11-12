# Atualização do Node.js no aaPanel

## Problema Identificado
Seu servidor está rodando Node.js 10.19.0, mas o sistema requer Node.js >= 18.17.0

## Solução: Instalar Node.js 20 LTS

### Opção 1: Via NVM (Recomendado)

\`\`\`bash
# 1. Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# 4. Verificar instalação
node -v  # Deve mostrar v20.x.x
npm -v   # Deve mostrar v10.x.x
\`\`\`

### Opção 2: Via NodeSource (Alternativa)

\`\`\`bash
# 1. Remover versão antiga
sudo apt-get remove nodejs npm -y

# 2. Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 3. Instalar Node.js 20
sudo apt-get install -y nodejs

# 4. Verificar instalação
node -v  # Deve mostrar v20.x.x
npm -v   # Deve mostrar v10.x.x
\`\`\`

### Opção 3: Via aaPanel (Interface Gráfica)

1. Acesse o painel aaPanel
2. Vá em **App Store** → **Find**
3. Procure por **Node.js Manager** ou **PM2 Manager**
4. Instale e configure Node.js 20 LTS

## Após Atualizar o Node.js

\`\`\`bash
# 1. Limpar cache e node_modules antigos
cd /var/www/invoice-system
rm -rf node_modules package-lock.json
npm cache clean --force

# 2. Instalar dependências
npm install

# 3. Build do projeto
npm run build

# 4. Iniciar aplicação
npm start
\`\`\`

## Verificar Permissões (se necessário)

\`\`\`bash
# Se encontrar erros de permissão durante npm install:
sudo chown -R $USER:$USER /var/www/invoice-system
sudo chmod -R 755 /var/www/invoice-system
\`\`\`

## Configurar PM2 para Produção

\`\`\`bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
cd /var/www/invoice-system
pm2 start npm --name "invoice-system" -- start

# Configurar para iniciar com o sistema
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs invoice-system
\`\`\`

## Troubleshooting

### Erro: "comando nvm não encontrado"
\`\`\`bash
# Adicionar ao ~/.bashrc
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
\`\`\`

### Erro: "EACCES: permission denied"
\`\`\`bash
# Corrigir permissões do npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
\`\`\`

### Erro ao compilar módulos nativos
\`\`\`bash
# Instalar ferramentas de build
sudo apt-get update
sudo apt-get install -y build-essential python3
\`\`\`

## Próximos Passos

Após atualizar o Node.js e instalar as dependências com sucesso:

1. Configure as variáveis de ambiente (`.env.local`)
2. Execute o build (`npm run build`)
3. Inicie a aplicação (`npm start` ou PM2)
4. Configure o Nginx como proxy reverso
5. Configure SSL com Let's Encrypt
\`\`\`

```json file="" isHidden
