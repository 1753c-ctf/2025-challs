#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>


int main() {

    char message1[] = "What's your name?\n\0";
    char message2[] = "Can you provide me with country also? I will save it\n\0";
    char message3[] = "Hello! \0";

    write(1, message1, strlen(message1));

    char buffer[24];
    read(0, buffer, 120);

    write(1, message3, strlen(message3));
    write(1, buffer, strlen(buffer));

    write(1, message2, strlen(message2));
    read(0, buffer, 120);

    printf("Data saved, thank you. Good luck in the challenge.\n");
    return 0;
}


void your_goal() {
    FILE *file;
    char buffer[256];

    file = fopen("./flag", "r");
    if (file == NULL) {
        perror("can not open the flag /flag");
        return;
    }

    while (fgets(buffer, sizeof(buffer), file) != NULL) {
	write(1, buffer, 40);
    }

    fclose(file);
}
