#include "mouse.h"

int (mouse_write_command)(uint8_t cmd , uint8_t* response){
    for (int i = 3 ; i > 0 ; i--){
        if (KBC_write_input(COMMAND_INTERACT,WRITE_TO_AUX_DEV) != OK) continue;
        if (KBC_write_input(KBC_IN_BUFF , cmd) != OK) continue;
        uint8_t ackn;
        if (KBC_read_output(KBC_OUT_BUFF,&ackn) != OK) continue;
        if (ackn == MOUSE_OK) return 0;
    }
    return 1;
}



int (mouse_enable_data_reporting_mv)(){
    uint8_t r;
    mouse_write_command(ENABLE_DATA_REPORTING_CMD,&r);
    return 0;
}

int (mouse_disable_data_reporting)(){
    uint8_t r;
    mouse_write_command(DISABLE_DATA_REPORTING_CMD, &r);
    return 0;
}


int mouse_hook_id = 2;
int (mouse_subscribe_int)(uint8_t* bit_no){
    *bit_no = mouse_hook_id;
    return sys_irqsetpolicy(MOUSE_IRQ_LINE,IRQ_REENABLE | IRQ_EXCLUSIVE ,&mouse_hook_id);
}

int (mouse_unsubscribe_int)(){
    return sys_irqrmpolicy(&mouse_hook_id);
}

struct packet mouse_packet;
int mouse_index = 0;
bool mouse_ready = false;

void (mouse_ih)(void){
    uint8_t st ,out;
    KBC_get_status(&st);
    
    if ((st & OUTPUT_BUFFER_FULL)&& !(st & (PARITY_ERROR | TIMEOUT_ERROR))){
        if (KBC_read_output(KBC_OUT_BUFF,&out)!= OK) return;
        mouse_packet.bytes[mouse_index] = out;
        if (mouse_index == 0 && !(out & FIRST_BYTE_PACKET)){
            printf("BAD BYTE!\n");
            return;
        }
        switch (mouse_index) {
            case 0:
               mouse_packet.lb = out & BIT(0);
               mouse_packet.rb = out & BIT(1);
               mouse_packet.mb = out & BIT(2);

               mouse_packet.x_ov = out & BIT(6);
               mouse_packet.y_ov = out & BIT(7);
                break;

            case 1:
               mouse_packet.delta_x = out;
                if (mouse_packet.bytes[0] & BIT(4))mouse_packet.delta_x |= 0xFF00;
                break;
                
            case 2:
               mouse_packet.delta_y = out;
                if (mouse_packet.bytes[0] & BIT(5))mouse_packet.delta_y |= 0xFF00;
                break;
        }
        mouse_index++;
        if (mouse_index == 3) {
            mouse_ready = true;
            mouse_index = 0;
        }
    }
}


