#include <stdint.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <arpa/inet.h>
#include <unistd.h>

#define HEADER_LENGTH 16
#define CRC_LENGTH 4
#define MAX_DATA_SIZE 512
#define OP_PING 0
#define OP_SAVE 1

FILE* save_file = NULL;

void process_content(uint8_t* data, size_t data_length) {
        for (size_t i = 0; i < data_length; i++) {
                if (data[i] == 0) {
                        break;
                }
                data[i] = data[i] + 42;
        }
}

void process_save(uint8_t* data, size_t data_length) {
	process_content(data, data_length);
        fwrite(&data_length, sizeof(data_length), 1, save_file);
        fwrite(data, 1, data_length, save_file);
}

void process_ping(const uint8_t* data, size_t data_length) {
	uint8_t header_buff[HEADER_LENGTH];
	uint32_t crc = 0xffffffff;
	memset(header_buff, 0, HEADER_LENGTH);
	header_buff[0] = 0x11;
	header_buff[1] = OP_PING;
	*(uint16_t*)(header_buff+4) = htons(data_length+CRC_LENGTH);
	write(STDOUT_FILENO, header_buff, HEADER_LENGTH);
	write(STDOUT_FILENO, data, data_length);
	write(STDOUT_FILENO, &crc, CRC_LENGTH);
}

void process_message(const uint8_t* message, FILE* save_file) {
        uint8_t protocol_version = message[0];
        uint8_t op = message[1];
        uint16_t data_length = ntohs(*(uint16_t*)(message+2));
	uint8_t data[MAX_DATA_SIZE];
	if (data_length > MAX_DATA_SIZE + CRC_LENGTH) {
		return;
	}
        uint16_t data_no_footer_length = data_length - CRC_LENGTH;
	if (op == OP_PING) {
		process_ping(message+HEADER_LENGTH, data_no_footer_length);
	}
	if (op == OP_SAVE) {
		//uint8_t data[MAX_DATA_SIZE];
		memcpy(data, message+HEADER_LENGTH, data_no_footer_length);
		process_save(data, data_no_footer_length);
	}
}

int main() {
        save_file = fopen("save.dat", "ab+");
        uint8_t message[1500];
        while (true) {
                ssize_t bytes_read = read(STDIN_FILENO, message, 1500);
                if (bytes_read == 0 || bytes_read == -1) {
                        break;
                }
                process_message(message, save_file);
        }
	fclose(save_file);
}
