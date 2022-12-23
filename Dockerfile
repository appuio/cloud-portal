FROM nginxinc/nginx-unprivileged:1.23.3

COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY dist/cloud-portal/en-CH /usr/share/nginx/html
