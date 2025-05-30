#!/bin/bash

# Remover node_modules e package-lock.json existentes
rm -rf node_modules package-lock.json

# Instalar dependências com força
npm install --force

# Executar build
npm run build 