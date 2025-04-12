#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int isFlag(char* secret, char* param1, char* param2)
{
    char *prefix, *content;

    if(strlen(secret) != 30)
       return 0;

    if(strchr(secret, '{') == NULL || strchr(secret, '}') == NULL)
        return 0;

    prefix = strsep(&secret, "{");
    content = strsep(&secret, "}");

    unsigned int seed = 0;
    for(unsigned int i = 0; i < strlen(prefix); i++)
        seed += prefix[i];
    
    seed *= 1753 + 'c';

    int pauses[24];
    
    int sum = 0;
    for(int i = 0; i < strlen(param2); i++)
        sum += param2[i];
    
    pauses[4] = atoi(strsep(&prefix, "c")) - 1231;
   
    pauses[2] = 1 + 1;
    pauses[pauses[2] + 1] = 82;
    pauses[5] = 17 * pauses[2];
    pauses[19] = 41 + strlen(secret);
    pauses[15] = pauses[2] * 50; 
    pauses[10] = pauses[15] - 10; 
    pauses[1] = 474;
    pauses[6] = 49 + (2 * strlen(secret));
    pauses[8] = 74;
    pauses[9] = strlen(param1);
    pauses[7] = pauses[1] / 6;
    pauses[22] = pauses[6] + pauses[7] + 1;
    pauses[11] = pauses[15] + 5; 
    pauses[12] = 82;
    pauses[14] = 236;
    pauses[13] = pauses[14];
    pauses[14]++;  
    pauses[16] = pauses[1] - pauses[19]; 
    pauses[17] = pauses[9] * 4;
    pauses[18] = (pauses[14] + 12) * strlen(secret) + 350;
    pauses[14]++;
    pauses[20] = sum + 14;
    pauses[19]++;
    pauses[21] = seed / ((pauses[14]) * 10) + (pauses[8] / 10);
    pauses[18] *= strlen(secret);
    pauses[14]++;
    pauses[19]++;
    pauses[22] = -strcmp(prefix, "n0t_th1z_w4y") +  pauses[9] * pauses[2] + pauses[2];
    pauses[23] = (2 << 12) / 282;
    pauses[18] += 350;

    for(int i = 1; i <= 23; i++)
    {
        char c;
        int p = pauses[i];
        for(int j = 0; j < p; j++)
            c = random() % 128;

        if(c != content[i - 1])
            return 0;
    }

    return 1;
}

int main(int argc, char* argv[]) {

    if(argc < 2) {
        printf("Usage: %s <secret>\n", argv[0]);
        return 1;
    }

    if(isFlag(argv[1], "denied", "xdxd") > 0) {
        printf("Yes, that's the flag\n");
    } else {
        printf("Nope.\n");
    }
    
    return 0;
}