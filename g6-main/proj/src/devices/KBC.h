#ifndef KBCHEADER
#define KBCHEADER

#include <lcom/lcf.h>
#include "i8042.h"

/**
 * @brief Reads the output buffer from the keyboard controller
 * @param port register to read from
 * @param output pointer to the variable where the output will be stored
 * @return 0 if successful, 1 otherwise
 */ 
int (KBC_read_output)(int port , uint8_t* output);


/**
 * @brief Reads the status from the keyboard controller
 * @param st pointer to the variable where the status will be stored
 * @return 0 if successful, 1 otherwise
*/
int (KBC_get_status)(uint8_t* st);

/**
 * @brief Writes a command to the keyboard controller
 * @param port register to write to
 * @param input command to be written
 * @return 0 if successful, 1 otherwise
*/
int (KBC_write_input)(int port, uint8_t input);


#endif
