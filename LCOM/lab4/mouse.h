#ifndef MOUSE_HEADER
#define MOUSE_HEADER

#include <lcom/lcf.h>
#include "util.h"
#include "../lab3/i8042.h"
#include "KBC.h"

extern struct packet p;
extern int i;
extern bool ready;

int (mouse_write_command)(uint8_t cmd , uint8_t* response);

int (mouse_enable_data_reporting_mv)();

int (mouse_disable_data_reporting)();


int (mouse_subscribe_int)(uint8_t* bit_no);

int (mouse_unsubscribe_int)();

void (mouse_ih)(void);

int mouse_gesture_state_mach(struct packet *pp, uint8_t x_len, uint8_t tolerance);


#endif
