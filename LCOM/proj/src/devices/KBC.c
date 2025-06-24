#include "KBC.h"

/**
 * @brief Reads the output buffer from the keyboard
 * @param port Port to read from
 * @param output Output to read
 */
int (KBC_read_output)(int port , uint8_t* output){
    uint8_t st;
    for(int count = MAX_ATTEMPTS ; count > 0 ; count--){
        KBC_get_status(&st);
        if ( st & OUTPUT_BUFFER_FULL){
            if (util_sys_inb(port , output)) return 1;

            if (st & (TIMEOUT_ERROR | PARITY_ERROR)){ 
                 
                return 1;
            }

            return 0;
        }
        tickdelay(micros_to_ticks(DELAY));
    }
    return 1;
}

/**
 * @brief Writes the input to the keyboard
 * @param port Port to write to
 * @param input Input to write
 */
int (KBC_write_input)(int port , uint8_t input){
    uint8_t st;
    for(int count = MAX_ATTEMPTS ; count > 0 ; count--){
        KBC_get_status(&st);
        if (!(st & INPUT_BUFFER_FULL)){
            return sys_outb(port, input);
        }
        tickdelay(micros_to_ticks(DELAY));
    }
    return 1;
}

/**
 * @brief Reads the status register
 * 
 */
int (KBC_get_status)(uint8_t* st){
    return util_sys_inb(KBC_STATUS_REG,st);
}

