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

struct packet p;
bool ready = false;
int i = 0;
void (mouse_ih)(void){
    uint8_t st ,out;
    KBC_get_status(&st);
    
    if ((st & OUTPUT_BUFFER_FULL)&& (st & AUX) && !(st & (PARITY_ERROR | TIMEOUT_ERROR))){
        if (KBC_read_output(KBC_OUT_BUFF,&out)!= OK) return;
        p.bytes[i] = out;
        if (i == 0 && !(out & FIRST_BYTE_PACKET)){
            printf("BAD BYTE!\n");
            return;
        }
        switch (i) {
            case 0:
                p.lb = out & BIT(0);
                p.rb = out & BIT(1);
                p.mb = out & BIT(2);

                p.x_ov = out & BIT(6);
                p.y_ov = out & BIT(7);
                break;

            case 1:
                p.delta_x = out;
                if (p.bytes[0] & BIT(4)) p.delta_x |= 0xFF00;
                break;
                
            case 2:
                p.delta_y = out;
                if (p.bytes[0] & BIT(5)) p.delta_y |= 0xFF00;
                break;
            }
            i++;
            if (i == 3) {
            ready = true;
            i = 0;
        }
    }
}

typedef enum {INITIAL,FIRST_DIAGONAL,MIDDLE,SECOND_DIAGONAL,COMP } statet_t;
statet_t state = INITIAL;
long mov_x = 0;
long mov_y = 0;
int mouse_gesture_state_mach(struct packet* pp, uint8_t x_len, uint8_t tolerance){
    switch (state){
        case INITIAL:
            if (pp->lb && !pp->mb && !pp->rb){
                state = FIRST_DIAGONAL;
                mov_x =0;
                mov_y =0;
            }
            break;
        case FIRST_DIAGONAL:
            if (pp->mb || pp->rb ){
                state  = INITIAL;
            }
            else if (pp->delta_x < -tolerance || pp->delta_y < -tolerance){
                state = INITIAL;
            }
            mov_x +=pp->delta_x;
            mov_y += pp->delta_y;
            if ( !pp->lb && mov_y/mov_x >= 1 && mov_x > x_len){
                state = MIDDLE;
            }
            else if (!pp->lb){
                state = INITIAL;
            }
            break;
        case MIDDLE:
            if (pp->lb || pp->mb) state = INITIAL;
            if (pp->rb){
                state = SECOND_DIAGONAL;
                mov_x =0;
                mov_y =0;
                break;
            }
            if (pp->delta_x >tolerance || pp->delta_x < - tolerance || pp->delta_y >tolerance || pp->delta_y < - tolerance){
                state = INITIAL;
            }
            break;
        case SECOND_DIAGONAL:
            if (pp->lb || pp->mb ){
                state  = INITIAL;
            }
            else if (mov_x < -tolerance || mov_y > tolerance){
                state = INITIAL;
            }
            mov_x +=pp->delta_x;
            mov_y +=pp->delta_y;
            if ( !pp->rb && mov_y/mov_x <= -1 && mov_x > x_len){
                state = COMP;
                return 1;
            }
            else if (!pp->rb){
                state = INITIAL;
            }
            break;
        case COMP:
            return 1;
    }
    return 0;
}

bool rb = false;
bool lb = false;
bool be = false;
struct mouse_ev (create_mouse_ev)(struct packet* pp){
    struct mouse_ev res;
    if (pp->lb != lb){
        lb = pp->lb;
        if (lb) res.type = LB_PRESSED;
        else res.type = LB_RELEASED;
    }
    else if (pp->rb != rb){
        rb = pp->rb;
        if (rb) res.type = RB_PRESSED;
        else res.type = RB_RELEASED;
    }
    else if (pp->mb != be){
        be = pp->mb;
        res.type = BUTTON_EV;
    }
    else {
        res.type = MOUSE_MOV;
    }
    res.delta_x = pp->delta_x;
    res.delta_y = pp->delta_y;
    return res;
}



