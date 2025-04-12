FROM node:18

WORKDIR /app

COPY src/package*.json ./
RUN npm install

COPY src/ ./src/

EXPOSE 1337

CMD ["node", "--no-node-snapshot", "src/index.js"]