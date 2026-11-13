FROM nginxinc/nginx-unprivileged:alpine
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
