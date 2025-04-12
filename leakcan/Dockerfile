FROM ubuntu:22.04

ARG FLAG

RUN apt-get update && apt-get install -y \
    libc6 \
    socat \
    gcc \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash user

COPY chall.c /home/user/chall.c

WORKDIR /home/user/

RUN echo $FLAG > /home/user/flag
RUN gcc -w --static -fstack-protector --no-pie -o /home/user/chall /home/user/chall.c && chmod +x /home/user/chall

USER user

EXPOSE 1337

CMD ["socat", "TCP4-LISTEN:1337,reuseaddr,fork", "EXEC:./chall"]
