FROM node:current-bookworm

EXPOSE 1337

RUN apt update && apt install -y socat

RUN mkdir /app
WORKDIR /app

COPY app.js .

CMD ["socat", "TCP4-LISTEN:1337,reuseaddr,fork", "EXEC:/usr/local/bin/node /app/app.js,pty,stderr"]
