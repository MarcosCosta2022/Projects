#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>

#define BIT(n) (1<<(n))

char *byte2bin(uint8_t n, char *binstr) 
{
    // one element per bit (0/1)
    uint8_t binary[8];

    int i = 0;
    for(i = 0; i < 8; i++) {
        binary[i] = n % 2;
        n = n / 2;
    }

    // printing binary array in reverse order
    for (int j = 7, k= 0; j >= 0; j--, k++)
        sprintf(binstr + k, "%d", binary[j]);
        
	return binstr;
}

void print_usage(char *name) {
	printf("Usage: %s <action> <byte> <bit no>\n", name);
	printf("\tWhere: <action> one of 'h'|'l'|'r'|'s'|'t'\n"
		"\t\t <byte> 8-bit integer in hexadecimal\n"
		"\t\t <bit no> of bit to operate on\n");
}

int main(int argc, char *argv[])
{
	char a;	// action: 'h', 'l', 'r', 's', 't'
	unsigned long n; // value to convert must be smaller than 256
	int bit; // bit to operate on: must be between 0 an 7
    char binary[9]; // array for binary representation of n,
					//  remember that in C strings are terminated with a 0
 
	// Validate command line arguments
    if (argc != 4) {
        print_usage(argv[0]);
        return 1;
    }
    a = argv[1][0];
    n = strtoul(argv[2], NULL, 16);
    bit = atoi(argv[3]);

	if (a != 'h' && a != 'l' && a != 'r' && a != 's' && a != 't') {
        print_usage("bitwise");
        return 1;
    }
    if (n >= 256) {
        print_usage("bitwise");
        return 1;
    }
    if (bit < 0 || bit > 7) {
        print_usage("bitwise");
        return 1;
    }

	// Print to stdout the binary representation of n
    printf("Action: %c\n", a);
	printf("The binary representation of %lu is %s\n", n, byte2bin(n, binary));
    printf("Bit no: %d\n", bit);

	// Do what the user asked and print the result
    unsigned long temp = 0;
	if (a == 'h') { 
        temp = n&BIT(bit);
        char result[10];
        if (temp != 0){
            strcpy(result, "True");
        }
        else{
            strcpy(result, "False");
        }
        printf("The result of the operation is %s\n", result);
    }
    else if (a == 'l') {
        temp = n&(BIT(bit));
        char result[10];
        if (temp == 0){
            strcpy(result, "True");
        }
        else{
            strcpy(result, "False");
        }
        printf("The result of the operation is %s\n", result);
    }
    else if (a == 'r') {
        temp =  n &(~BIT(bit));
        printf("The result of the operation is %lu\n", temp);
        printf ("The binary representation of %lu is %s\n", temp, byte2bin(temp, binary));
    }
    else if (a == 's') {
        temp = n | BIT(bit);
        printf("The result of the operation is %lu\n", temp);
        printf ("The binary representation of %lu is %s\n", temp, byte2bin(temp, binary));
    }
    else if (a == 't') {
        temp = n & BIT(bit);
        if (temp == 0){
            temp = n | BIT(bit);
        }
        else {
            temp = n & (~BIT(bit));
        }
        printf("The result of the operation is %lu\n", temp);
        printf ("The binary representation of %lu is %s\n", temp, byte2bin(temp, binary));
    }

    return 0;
}

