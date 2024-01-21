FROM php:8.3.1-apache

# Set working directory
WORKDIR /var/www/html

# Install mysqli
RUN docker-php-ext-install mysqli
RUN a2enmod rewrite

# Install Git, Zip, and Composer
RUN apt-get update && \
    apt-get install -y git zip unzip && \
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php --install-dir=/usr/local/bin --filename=composer && \
    php -r "unlink('composer-setup.php');"

RUN mkdir -p /var/www/html/templates/cache && chmod -R 777 /var/www/html/templates/cache

# Expose port 80
EXPOSE 80


# FROM php:8.3.1-apache

# # Install mysqli
# RUN docker-php-ext-install mysqli
# RUN a2enmod rewrite

# # Install Git, Zip, and Composer
# RUN apt-get update && \
#     apt-get install -y git zip unzip && \
#     php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
#     php composer-setup.php --install-dir=/usr/local/bin --filename=composer && \
#     php -r "unlink('composer-setup.php');"

# # Set working directory
# WORKDIR /var/www/html

# # Copy existing application directory contents
# COPY ./ /var/www/html

# RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

# # Install dependencies
# RUN composer install

# # Expose port 80
# EXPOSE 80
