FROM node:18

WORKDIR /app

ARG FLAG

COPY src/package*.json ./
RUN npm install

COPY src/ ./src/

RUN sed -i "s/FLAGHERE/$FLAG/g" src/flag.txt

EXPOSE 1337

CMD ["node", "src/index.js"]