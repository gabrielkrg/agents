#!/bin/bash

# Script para limpar TODOS os caches do Laravel
# Use quando o cache estiver causando problemas

echo "🧹 Limpando todos os caches do Laravel..."

# Limpar via Artisan
php artisan optimize:clear

# Deletar arquivos de cache manualmente (caso o Artisan não consiga)
rm -f bootstrap/cache/config.php
rm -f bootstrap/cache/routes-v7.php
rm -f bootstrap/cache/services.php
rm -f bootstrap/cache/packages.php

# Limpar cache de storage
rm -rf storage/framework/cache/data/*
rm -rf storage/framework/views/*
rm -rf storage/framework/sessions/*

echo "✅ Todos os caches foram limpos!"
echo ""
echo "Agora você pode executar: composer run dev"

