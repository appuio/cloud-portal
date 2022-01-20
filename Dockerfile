FROM nginxinc/nginx-unprivileged:1.21.4

COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY dist/cloud-portal/en-CH /usr/share/nginx/html
