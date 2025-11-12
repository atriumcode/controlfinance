#!/bin/bash
# Script para carregar variáveis de ambiente e iniciar o Next.js

# Carregar variáveis do .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Iniciar Next.js
npm start
