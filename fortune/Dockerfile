FROM emscripten/emsdk:latest AS builder

WORKDIR /src

COPY src/fortune_api.c .

# Build the binary WASM module
RUN emcc fortune_api.c -o fortune_api.js -s WASM=1 \
    -s EXPORTED_FUNCTIONS='["_main", "_GetCategories", "_GetFortune", "_GetFlag"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s ASYNCIFY=1 \
    -s FETCH=1

# Second stage: Set up Node.js server
FROM node:16-bookworm

RUN apt update
RUN apt install fortune -y

WORKDIR /app

# Copy the WASM module from the builder stage
COPY --from=builder /src/fortune_api.wasm ./public/
COPY --from=builder /src/fortune_api.js ./public/

# Copy your application files
COPY src/package.json .

# Install dependencies
RUN npm install


COPY src/flag.c . 

RUN apt install gcc -y \ 
    && gcc flag.c -o flag \
    && apt remove gcc -y \
    && rm flag.c

RUN chmod +x flag

COPY src/index.js .
COPY src/public/ ./public/

# Expose the port your app runs on
EXPOSE 1337

USER nobody

# Start the server
CMD ["node", "index.js"]