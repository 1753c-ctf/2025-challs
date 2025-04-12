FROM gcc:14.2.0

RUN apt-get update && apt-get install -y socat

RUN mkdir /app
WORKDIR /app

ADD data_saver.c Makefile flag ./

RUN make

RUN ln -s /dev/null save.dat

RUN useradd -d /app ctf
USER ctf

EXPOSE 1337

CMD ["socat", "tcp-listen:1337,reuseaddr,fork", "exec:/app/data_saver"]
