#ifndef KBCHEADER
#define KBCHEADER

#include <lcom/lcf.h>
#include "../lab3/i8042.h"


int (KBC_read_output)(int port , uint8_t* output);

int (KBC_get_status)(uint8_t* st);

int (KBC_write_input)(int port , uint8_t input);

void (kbc_ih)();

#endif
