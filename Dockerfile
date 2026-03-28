FROM nginxinc/nginx-unprivileged:alpine
COPY public/ /usr/share/nginx/html/
