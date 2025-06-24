#ifndef KBDHEADER
#define KBDHEADER

#include <lcom/lcf.h>
#include "i8042.h"
#include "KBC.h"

extern char keys[0x90];

extern uint8_t scan_code[2];
extern int kbd_i;
extern bool kbd_ih_flag;

/**
 * @brief Subscribes and enables keyboard interrupts
 * @param bit_no address of memory to be initialized with the bit number to be set in the mask returned upon an interrupt
 * @return 0 if successful, 1 otherwise
 */
int (kbd_subscribe_int)(uint8_t* bit_no);

/**
 * @brief Unsubscribes keyboard interrupts
 * @return 0 if successful, 1 otherwise
 */
int (kbd_unsubscribe_int)();

/**
 * @brief Interrupt handler for controller interrupts
 */
void (kbc_ih)();

/**
 * @brief Restores the keyboard to its' original state
 * @return 0 if successful, 1 otherwise
 */
int (kbd_restore)();

#endif
