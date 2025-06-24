#ifndef MOUSE_HEADER
#define MOUSE_HEADER

#include <lcom/lcf.h>
#include "i8042.h"
#include "KBC.h"

extern struct packet mouse_packet;
extern int mouse_index;
extern bool mouse_ready;

/**
 * @brief Writes a command to the mouse
 * @param cmd command to be written
 * @param response pointer to the variable where the response will be stored
 * @return 0 if successful, 1 otherwise
*/
int (mouse_write_command)(uint8_t cmd , uint8_t* response);

/**
 * @brief Enables data reporting
 * @return 0 if successful, 1 otherwise
*/
int (mouse_enable_data_reporting_mv)();

/**
 * @brief Disables data reporting
 * @return 0 if successful, 1 otherwise
*/
int (mouse_disable_data_reporting)();

/**
 * @brief Subscribes mouse interrupts
 * @param bit_no address of memory to be initialized with the bit number to be set in the mask returned upon an interrupt
 * @return 0 if successful, 1 otherwise
*/
int (mouse_subscribe_int)(uint8_t* bit_no);

/**
 * @brief Unsubscribes mouse interrupts
 * @return 0 if successful, 1 otherwise
*/
int (mouse_unsubscribe_int)();

/**
 * @brief Mouse interrupt handler
*/
void (mouse_ih)(void);

#endif
