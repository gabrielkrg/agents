#!/bin/bash

# Script de emergência para corrigir cache corrompido em produção
# Execute este script quando receber erros como "Class 'view' does not exist"

echo "🔧 Corrigindo cache corrompido em produção..."

# 1. Limpar todos os caches manualmente
echo "1. Limpando arquivos de cache..."
rm -f bootstrap/cache/config.php
rm -f bootstrap/cache/routes-v7.php
rm -f bootstrap/cache/services.php
rm -f bootstrap/cache/packages.php

# 2. Limpar via Artisan (se possível)
php artisan optimize:clear 2>/dev/null || echo "⚠️  Não foi possível executar optimize:clear"

# 3. Regenerar autoload do Composer
echo "2. Regenerando autoload do Composer..."
composer dump-autoload --optimize --no-dev

# 4. Limpar cache de storage
echo "3. Limpando cache de storage..."
rm -rf storage/framework/cache/data/*
rm -rf storage/framework/views/*

# 5. Recriar caches (apenas se não houver erros)
#echo "4. Recriando caches..."
#php artisan config:cache
#php artisan route:cache
#php artisan view:cache

echo "✅ Cache corrigido!"

