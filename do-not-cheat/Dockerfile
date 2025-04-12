FROM node:18

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    --no-install-recommends \
    && if [ "$(uname -m)" = "x86_64" ]; then \
        curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
        && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
        && apt-get update \
        && apt-get install google-chrome-stable -y --no-install-recommends; \
    elif [ "$(uname -m)" = "aarch64" ]; then \
        apt-get install -y chromium --no-install-recommends; \
    fi \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY src/package*.json ./
RUN npm install

COPY src/ ./src/

EXPOSE 1337

CMD ["node", "src/index.js"]