#ifndef KEYBOARD_UTIL
#define KEYBOARD_UTIL

#include "i8042.h"
#include <lcom/lcf.h>

int (util_sys_inb)(int port , uint8_t *value);

#endif 

