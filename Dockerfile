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

# Prepare directories for Nginx and Supervisor
RUN mkdir -p /etc/nginx/http.d \
             /etc/supervisor/conf.d \
             /run/nginx \
             /var/log/supervisor \
             /var/log/nginx

# Set working directory
WORKDIR /var/www/html

# Copy application source
COPY . .

# Handle file placement whether build context is repo root or backend/
RUN if [ -d "backend/docker" ]; then \
        cp backend/docker/nginx.conf /etc/nginx/http.d/default.conf && \
        cp backend/docker/supervisord.conf /etc/supervisord.conf && \
        cp backend/docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf && \
        cp backend/docker/entrypoint.sh /usr/local/bin/entrypoint.sh && \
        cp -r backend/* . && \
        rm -rf backend frontend; \
    elif [ -d "docker" ]; then \
        cp docker/nginx.conf /etc/nginx/http.d/default.conf && \
        cp docker/supervisord.conf /etc/supervisord.conf && \
        cp docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf && \
        cp docker/entrypoint.sh /usr/local/bin/entrypoint.sh; \
    else \
        echo "Error: docker/ directory not found in build context" && exit 1; \
    fi && \
    chmod +x /usr/local/bin/entrypoint.sh

# Install production dependencies
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Set permissions for storage and bootstrap cache
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 775 storage bootstrap/cache

# Expose port (Render overrides with dynamic $PORT)
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
