#include <lcom/lcf.h>

#include <lcom/lab3.h>

#include <stdbool.h>
#include <stdint.h>

#include "i8042.h"
#include "KBC.h"
#include "keyboard.h"
#include "utils.h"


extern uint8_t kbc_output;
extern int kbc_ih_error;
extern int count_sys_inb_calls;

extern int timer_counter;


int main(int argc, char *argv[]) {
  // sets the language of LCF messages (can be either EN-US or PT-PT)
  lcf_set_language("EN-US");

  // enables to log function invocations that are being "wrapped" by LCF
  // [comment this out if you don't want/need it]
  lcf_trace_calls("/home/lcom/labs/lab3/trace.txt");

  // enables to save the output of printf function calls on a file
  // [comment this out if you don't want/need it]
  lcf_log_output("/home/lcom/labs/lab3/output.txt");

  // handles control over to LCF
  // [LCF handles command line arguments and invokes the right function]
  if (lcf_start(argc, argv))
    return 1;

  // LCF clean up tasks
  // [must be the last statement before return]
  lcf_cleanup();

  return 0;
}

int(kbd_test_scan)() {
    uint8_t hook_id;
    if (kbd_subscribe_int(&hook_id)) return 1;
    int irq_set = BIT(hook_id);

    int r,ipc_status;
    message msg;
    
    uint8_t scan_code[2];
    int index = 0;

    while(scan_code[index] != ESC_BREAK_CODE) { /* You may want to use a different condition */
    /* Get a request message. */
        if ( (r = driver_receive(ANY, &msg, &ipc_status)) != 0 ) { 
        printf("driver_receive failed with: %d", r);
        continue;
        }
        if (is_ipc_notify(ipc_status)) { /* received notification */
        switch (_ENDPOINT_P(msg.m_source)) {
            case HARDWARE: /* hardware interrupt notification */				
            if (msg.m_notify.interrupts & irq_set) { /* subscribed interrupt */
                kbc_ih();
                scan_code[index] = kbc_output;
                if (index == 0 && kbc_output == TWO_BYTES){
                    index++;
                    break;
                }
                else{
                    kbd_print_scancode(!(scan_code[index] & BREAK_CODE_BYTE),index+1,scan_code);
                    index = 0;
                }
            }
            break;
            default:
            break; /* no other notifications expected: do nothing */	
        }
        }else{ /* received a standard message, not a notification */
            /* no standard messages expected: do nothing */
        }
    }
    kbd_unsubscribe_int();
    kbd_print_no_sysinb(count_sys_inb_calls);
    return 0;
}

int(kbd_test_poll)() {
    uint8_t scan_code[2];
    int index = 0;
    uint8_t st;

    while (scan_code[index] != ESC_BREAK_CODE){
        KBC_get_status(&st);
        
        if (!(st & AUX) && (st & OUTPUT_BUFFER_FULL)){
            kbc_ih();
            scan_code[index] = kbc_output;
            if (index == 0 && kbc_output == TWO_BYTES){
                index++;
                break;
            }
            else{
                kbd_print_scancode(!(scan_code[index] & BREAK_CODE_BYTE),index+1,scan_code);
                index = 0;
            }
        }
    }
    kbd_restore();
    return 0;
}

int(kbd_test_timed_scan)(uint8_t n) {
    uint8_t kbd_hook_id;
    if (kbd_subscribe_int(&kbd_hook_id)) return 1;
    int kbd_irq_set = BIT(kbd_hook_id);

    uint8_t timer_hook_id;
    if (timer_subscribe_int(&timer_hook_id)) {
        kbd_unsubscribe_int(&kbd_hook_id);
        return 1;
    }
    int timer_irq_set = BIT(timer_hook_id);

    int r,ipc_status;
    message msg;
    
    uint8_t scan_code[2];
    int index = 0;

    bool done = false;
    while(!done) { /* You may want to use a different condition */
    /* Get a request message. */
        if ( (r = driver_receive(ANY, &msg, &ipc_status)) != 0 ) { 
        printf("driver_receive failed with: %d", r);
        continue;
        }
        if (is_ipc_notify(ipc_status)) { /* received notification */
        switch (_ENDPOINT_P(msg.m_source)) {
            case HARDWARE: /* hardware interrupt notification */				
            if (msg.m_notify.interrupts & kbd_irq_set) { /* subscribed interrupt */
                kbc_ih();
                scan_code[index] = kbc_output;
                if (index == 0 && kbc_output == TWO_BYTES){
                    index++;
                    break;
                }
                else{
                    kbd_print_scancode(!(scan_code[index] & BREAK_CODE_BYTE),index+1,scan_code);
                    index = 0;
                }
                if (scan_code[index] == ESC_BREAK_CODE) done = true;
                timer_counter = 0;
            }
            else if (msg.m_notify.interrupts & timer_irq_set){
                timer_int_handler();
                if (timer_counter / 60.0 >= n) done = true;
            }
            else
            break;
            default:
            break; /* no other notifications expected: do nothing */	
        }
        }else{ /* received a standard message, not a notification */
            /* no standard messages expected: do nothing */
        }
    }
    timer_unsubscribe_int();
    kbd_unsubscribe_int();
    kbd_print_no_sysinb(count_sys_inb_calls);
    return 0;
}

