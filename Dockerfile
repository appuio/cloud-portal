FROM nginxinc/nginx-unprivileged:1.21.4

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/cloud-portal/en-CH /usr/share/nginx/html
