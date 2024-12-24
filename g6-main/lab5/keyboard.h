#ifndef KBDHEADER
#define KBDHEADER

#include <lcom/lcf.h>
#include "../lab3/i8042.h"
#include "KBC.h"

extern uint8_t kbc_output;
extern int kbc_ih_error;

int (kbd_subscribe_int)(uint8_t* bit_no);

int (kbd_unsubscribe_int)();

void (kbc_ih)();

int (kbd_restore)();

#endif
