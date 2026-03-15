#!/bin/bash
set -e

REPO_DIR="/home/zdream/repositories/zdream5"
WEB_ROOT="/home/zdream/public_html"
BUILD_DIR="$REPO_DIR/backend/public"
BACKEND_DIR="$REPO_DIR/backend"

echo "==> Pulling latest code..."
cd "$REPO_DIR"
git pull

echo "==> Installing PHP dependencies..."
cd "$BACKEND_DIR"
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Clearing & caching config/routes/views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "==> Syncing React build to web root..."
cd "$REPO_DIR"
# Xóa toàn bộ assets cũ (JS/CSS chunks) để tránh file thừa
rm -rf "$WEB_ROOT/assets"
mkdir -p "$WEB_ROOT/assets"

# Copy toàn bộ assets mới (bao gồm cả lazy-loaded chunks)
cp "$BUILD_DIR/assets/"* "$WEB_ROOT/assets/"

# Copy index.html và .htaccess mới (KHÔNG copy index.php — hosting cần path riêng)
cp "$BUILD_DIR/index.html" "$WEB_ROOT/index.html"
cp "$BUILD_DIR/.htaccess" "$WEB_ROOT/.htaccess"

echo "==> Done! Deploy completed."
