#!/bin/bash

# =======================================================
# Laravel Deployment Script
# =======================================================
# This script automates the deployment process for a Laravel application.
# It includes dependency installation, asset compilation, database migrations,
# and cache clearing.
#
# Usage:
#   bash deploy.sh (from the project root directory)
#
# Prerequisites:
#   - Composer installed
#   - Node.js and npm installed
#   - Git (for pulling updates if not done by CI/CD)
#   - .env file configured
# =======================================================

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"


# --- Configuration Variables ---
# Define paths and commands here for easy modification
PROJECT_ROOT=$(pwd) # Assumes script is run from project root
PHP_ARTISAN="php artisan"
COMPOSER_BIN="composer"
NPM_BIN="npm"

# --- Helper Functions ---

# Function to log messages with timestamps
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to check the exit status of the last command
check_status() {
    if [ $? -ne 0 ]; then
        log "ERROR: $1 failed. Exiting deployment."
        exit 1
    fi
}

# --- Main Deployment Steps ---

log "--- Starting Laravel Deployment ---"
log "Project Root: $PROJECT_ROOT"

# 1. Pull latest code (if not handled by CI/CD like GitHub Actions checkout)
log "1. Fetching latest code..."
git fetch --all
git reset --hard origin/main
check_status "Git sync"

# 2. Install Composer Dependencies
log "2. Installing Composer dependencies..."
$COMPOSER_BIN install --no-dev --prefer-dist --optimize-autoloader
check_status "Composer install"

# 3. Install NPM Dependencies & Build Assets
log "3. Installing NPM dependencies..."
$NPM_BIN install --silent
check_status "NPM install"

log "4. Building frontend assets..."
$NPM_BIN run build
check_status "NPM build"

# 5. Run Database Migrations
#    It's generally safer to run migrations in a separate step or
#    with --force in production. Ensure you have backups!
log "5. Running database migrations..."
$PHP_ARTISAN migrate --force # --force is required in production environments
check_status "Database migrations"

# 6. Clear Caches
log "6. Clearing various caches..."
$PHP_ARTISAN optimize:clear # Clears config, route, view, and application cache
check_status "Optimize clear"

# 7. (Optional) Re-cache configuration and routes
#    This speeds up subsequent requests but requires you to clear
#    cache if .env or config files change.
# log "7. Caching configuration and routes (optional)..."
#$PHP_ARTISAN config:clear
#$PHP_ARTISAN cache:clear
#$PHP_ARTISAN route:clear
#check_status "Cache clear"

#$PHP_ARTISAN config:cache
#$PHP_ARTISAN route:cache
#$PHP_ARTISAN view:cache
#check_status "Config cache"

# 8. (Optional) Symlink Storage
#    Ensure storage is linked if it's not done via other means
#    and necessary for your application.
# log "8. Linking storage directory..."
# $PHP_ARTISAN storage:link
# check_status "Storage link"

log "--- Deployment Finished Successfully! ---"