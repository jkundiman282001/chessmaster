#!/bin/sh
set -e

PORT="${PORT:-8080}"
echo "Configuring Nginx to listen on port $PORT..."
sed -i "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/http.d/default.conf

# Map DATABASE_URL and DB_URL so whichever is configured in Render works seamlessly
if [ -n "$DATABASE_URL" ] && [ -z "$DB_URL" ]; then
    export DB_URL="$DATABASE_URL"
elif [ -n "$DB_URL" ] && [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="$DB_URL"
fi

# Ensure runtime directories exist
mkdir -p /run/nginx /var/log/supervisor /var/log/nginx
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Generate application key if missing
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force || true
fi

# Clear previous cache to ensure fresh database and environment variables
php artisan config:clear || true

# Run database migrations against Neon (using direct unpooled connection if pooler is provided, as recommended by Neon for DDL)
if [ "$RUN_MIGRATIONS" != "false" ]; then
    echo "Running database migrations on PostgreSQL..."
    MIGRATE_URL=$(echo "$DATABASE_URL" | sed 's/-pooler\./\./g')
    DB_URL="$MIGRATE_URL" DATABASE_URL="$MIGRATE_URL" php artisan migrate --force || true
fi

# Cache Laravel optimizations for production performance
echo "Caching Laravel configuration, routes, and views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "Starting Nginx and PHP-FPM via Supervisord on port $PORT..."
if [ -f "/etc/supervisord.conf" ]; then
    exec /usr/bin/supervisord -c /etc/supervisord.conf
else
    exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
fi
