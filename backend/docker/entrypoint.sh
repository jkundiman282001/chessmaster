#!/bin/sh
set -e

# Render assigns dynamic port in $PORT environment variable
PORT="${PORT:-8080}"
echo "Configuring Nginx to listen on port $PORT..."
sed -i "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/http.d/default.conf

# Ensure storage and bootstrap cache directories exist and are writable
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Generate application key if missing
if [ -z "$APP_KEY" ]; then
    echo "Warning: APP_KEY not provided. Generating temporary key..."
    php artisan key:generate --force || true
fi

# Cache Laravel optimizations for production performance
echo "Caching Laravel configuration, routes, and views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Run database migrations against Neon
if [ "$RUN_MIGRATIONS" != "false" ]; then
    echo "Running database migrations on PostgreSQL..."
    php artisan migrate --force || echo "Migration command completed with warnings."
fi

echo "Starting Nginx and PHP-FPM via Supervisord on port $PORT..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
