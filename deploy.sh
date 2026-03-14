#!/bin/bash
set -e

REPO_DIR="/home/zdream/public_html"
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
# Xóa bundle JS/CSS cũ
rm -f "$WEB_ROOT/assets/index-"*.js "$WEB_ROOT/assets/index-"*.css

# Copy bundle mới từ backend/public/assets
cp "$BUILD_DIR/assets/index-"*.js "$WEB_ROOT/assets/"
cp "$BUILD_DIR/assets/index-"*.css "$WEB_ROOT/assets/"

# Copy index.html mới
cp "$BUILD_DIR/index.html" "$WEB_ROOT/index.html"

echo "==> Done! Deploy completed."
