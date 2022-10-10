# Author: Tim Schupp
# Creates a nginx container, rerouts a development frontent 
# to be served *with* the backend api trough one container
# Allows to bypass same-site and cors oring of browser without modifying backend cors

HOST="host.docker.internal:3000"
SERVER="host.docker.internal:8000"
#SERVER="lw.eu.ngrok.io"
#HOST="192.168.178.1:3000"
#HOST="timschupp.de"

read -r -d '' CONFIG << EOM
worker_processes  4;
user              www-data;

events {
    use           epoll;
    worker_connections  128;
}

http {

	sendfile on;
	tcp_nopush on;
	tcp_nodelay on;
	keepalive_timeout 65;
	types_hash_max_size 2048;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers on;

	gzip on;

    server {
        listen       80;
        server_name  localhost;
        include /etc/nginx/mime.types;

        location /api2/ {
            proxy_pass http://SERVER_URL/api2/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_cache_bypass \$http_upgrade;
	    }

        location /chat_ws {
            proxy_pass http://SERVER_URL/chat_ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_cache_bypass \$http_upgrade;
	    }

        location /media {
            proxy_pass http://SERVER_URL/media;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_cache_bypass \$http_upgrade;
	    }

        location / {
	    proxy_pass http://HOST_URL/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
	    }


        }

}
EOM

echo "$CONFIG" | sed "s|HOST_URL|$HOST|g" | sed "s|SERVER_URL|$SERVER|g" > ./nginx.conf

docker stop nginx-frontend-proxy
docker rm -v nginx-frontend-proxy
docker run \
    --name nginx-frontend-proxy \
    --add-host=host.docker.internal:host-gateway \
    -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
    -p 3333:80 \
    -d nginx
