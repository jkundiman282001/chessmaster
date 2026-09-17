FROM php:8.3-fpm-alpine

# Install system packages
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    oniguruma-dev \
    icu-dev

# Install PHP extensions required for Laravel, PostgreSQL, and performance
RUN docker-php-ext-install -j$(nproc) \
    pdo_pgsql \
    pgsql \
    bcmath \
    mbstring \
    zip \
    opcache \
    pcntl \
    intl

# Install Composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application source
COPY . .

# Configure Nginx, Supervisor, and startup script
RUN cp docker/nginx.conf /etc/nginx/http.d/default.conf && \
    cp docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf && \
    chmod +x docker/entrypoint.sh

# Install production dependencies
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Set permissions for storage and bootstrap cache
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 775 storage bootstrap/cache

# Expose port (Render overrides with dynamic $PORT)
EXPOSE 8080

ENTRYPOINT ["docker/entrypoint.sh"]
