#include "utils.h"

#ifdef LAB3
    int count_sys_inb_calls = 0;
#endif
int (util_sys_inb)(int port ,uint8_t* value){
    #ifdef LAB3
    count_sys_inb_calls++;
    #endif
    return sys_inb(port , (u32_t*) value);
}


