FROM debian:bookworm-20240211

ARG FLAG

EXPOSE 1337

RUN apt update && apt install -y socat

RUN mkdir /app
WORKDIR /app

RUN echo $FLAG > flag

CMD ["socat", "TCP4-LISTEN:1337,reuseaddr,fork", "EXEC:cat flag"]
