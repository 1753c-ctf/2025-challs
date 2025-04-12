FROM python:slim

EXPOSE 1337

RUN apt-get update && apt-get install -y socat

RUN pip install Pycryptodome

RUN mkdir /app
WORKDIR /app

COPY update.py secret.py generated.py /app/

CMD ["socat", "TCP4-LISTEN:1337,reuseaddr,fork", "EXEC:./update.py"]
