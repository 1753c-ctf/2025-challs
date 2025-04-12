#include <emscripten/emscripten.h>
#include <emscripten/fetch.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

// Fixed buffer for response data
#define BUFFER_SIZE 4096
char response_buffer[BUFFER_SIZE];
int response_ready = 0;

// Required for standalone WASM
EMSCRIPTEN_KEEPALIVE
int main() {
  return 0;
}

void success_callback(emscripten_fetch_t* fetch) {
  // Clear buffer
  memset(response_buffer, 0, BUFFER_SIZE);
  
  // Copy response to buffer (ensure we don't overflow)
  size_t copy_size = fetch->numBytes < (BUFFER_SIZE - 1) ? fetch->numBytes : (BUFFER_SIZE - 1);
  memcpy(response_buffer, fetch->data, copy_size);
  response_buffer[copy_size] = '\0';
  
  emscripten_fetch_close(fetch);

  response_ready = 1;
}

void error_callback(emscripten_fetch_t* fetch) {
  // Clear buffer
  memset(response_buffer, 0, BUFFER_SIZE);
  strcpy(response_buffer, "{\"error\": \"API request failed\"}");
  
  emscripten_fetch_close(fetch);

  response_ready = 1;
}

// API functions
EMSCRIPTEN_KEEPALIVE
char* GetCategories() {

  response_ready = 0;

  emscripten_fetch_attr_t attr;
  emscripten_fetch_attr_init(&attr);
  strcpy(attr.requestMethod, "GET");
  attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
  attr.onsuccess = success_callback;
  attr.onerror = error_callback;
  
  emscripten_fetch(&attr, "/api/v1.05.1753/categories");

  while(response_ready == 0)
    emscripten_sleep(100);
  
  return response_buffer;
}

EMSCRIPTEN_KEEPALIVE
char* GetFortune(const char* category) {

  response_ready = 0;

  emscripten_fetch_attr_t attr;
  emscripten_fetch_attr_init(&attr);
  strcpy(attr.requestMethod, "GET");
  attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
  attr.onsuccess = success_callback;
  attr.onerror = error_callback;
  
  // Create the URL with category parameter
  char url[256];
  sprintf(url, "/api/v1.05.1753/fortune?category=%s", category);
  
  emscripten_fetch(&attr, url);

  while(response_ready == 0)
    emscripten_sleep(100);
  
  return response_buffer;
}

EMSCRIPTEN_KEEPALIVE
char* GetFlag(const char* secret) {

  response_ready = 0;

  emscripten_fetch_attr_t attr;
  emscripten_fetch_attr_init(&attr);
  strcpy(attr.requestMethod, "GET");
  attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
  attr.onsuccess = success_callback;
  attr.onerror = error_callback;
  
  // Create the URL with secret parameter
  char url[256];
  sprintf(url, "/api/v1.03.410/verify-my-flag/%s", secret);
  
  emscripten_fetch(&attr, url);

  while(response_ready == 0)
    emscripten_sleep(100);

  return response_buffer;
}