// IMPORTANT: you must include the following line in all your C files
#include <lcom/lcf.h>

#include <stdint.h>
#include <stdio.h>

// Any header files included below this line should have been created by you

#include "mouse.h"
#include "KBC.h"
#include "../lab2/timer.c"

extern int timer_counter;

int main(int argc, char *argv[]) {
  // sets the language of LCF messages (can be either EN-US or PT-PT)
  lcf_set_language("EN-US");

  // enables to log function invocations that are being "wrapped" by LCF
  // [comment this out if you don't want/need/ it]
  lcf_trace_calls("/home/lcom/labs/lab4/trace.txt");

  // enables to save the output of printf function calls on a file
  // [comment this out if you don't want/need it]
  lcf_log_output("/home/lcom/labs/lab4/output.txt");

  // handles control over to LCF
  // [LCF handles command line arguments and invokes the right function]
  if (lcf_start(argc, argv))
    return 1;

  // LCF clean up tasks
  // [must be the last statement before return]
  lcf_cleanup();

  return 0;
}


int (mouse_test_packet)(uint32_t cnt) {
    uint8_t bit_no;
    mouse_subscribe_int(&bit_no);
    uint32_t irq_set = BIT(bit_no);

    if (mouse_enable_data_reporting_mv() != 0) {
        fprintf(stderr, "Error enabling data reporting!\n");
        mouse_unsubscribe_int();
        return -1;
    }
    int r,ipc_status;
    message msg;

    while(cnt > 0) { /* You may want to use a different condition */
    /* Get a request message. */
        if ( (r = driver_receive(ANY, &msg, &ipc_status)) != 0 ) { 
            printf("driver_receive failed with: %d", r);
            continue;
        }
        if (is_ipc_notify(ipc_status)) { /* received notification */
        switch (_ENDPOINT_P(msg.m_source)) {
            case HARDWARE: /* hardware interrupt notification */				
            if (msg.m_notify.interrupts & irq_set) { /* subscribed interrupt */
                mouse_ih();
                if (ready){
                    mouse_print_packet(&p);
                    ready = false;
                    cnt--;
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
    mouse_unsubscribe_int();
    mouse_disable_data_reporting();
    return 0;
}

int (mouse_test_async)(uint8_t idle_time) {
    uint8_t timer_bit_no;
    timer_subscribe_int(&timer_bit_no);
    uint32_t timer_irq_set = BIT(timer_bit_no);


    uint8_t bit_no;
    mouse_subscribe_int(&bit_no);
    uint32_t irq_set = BIT(bit_no);

    if (mouse_enable_data_reporting_mv() != 0) {
        fprintf(stderr, "Error enabling data reporting!\n");
        mouse_unsubscribe_int();
        return -1;
    }
    int r,ipc_status;
    message msg;

    while(timer_counter < idle_time*60) { /* You may want to use a different condition */
    /* Get a request message. */
        if ( (r = driver_receive(ANY, &msg, &ipc_status)) != 0 ) { 
            printf("driver_receive failed with: %d", r);
            continue;
        }
        if (is_ipc_notify(ipc_status)) { /* received notification */
        switch (_ENDPOINT_P(msg.m_source)) {
            case HARDWARE: /* hardware interrupt notification */				
            if (msg.m_notify.interrupts & irq_set) { /* subscribed interrupt */
                timer_counter = 0;
                mouse_ih();
                if (ready){
                    mouse_print_packet(&p);
                    ready = false;
                }
            }
            else if (msg.m_notify.interrupts & timer_irq_set){
                timer_int_handler();
            }
            break;
            default:
            break; /* no other notifications expected: do nothing */	
        }
        }else{ /* received a standard message, not a notification */
            /* no standard messages expected: do nothing */
        }
    }
    mouse_unsubscribe_int();
    mouse_disable_data_reporting();
    timer_unsubscribe_int();
    return 0;
}

int (mouse_test_gesture)(uint8_t x_len, uint8_t tolerance) {
    uint8_t bit_no;
    mouse_subscribe_int(&bit_no);
    uint32_t irq_set = BIT(bit_no);

    if (mouse_enable_data_reporting_mv() != 0) {
        fprintf(stderr, "Error enabling data reporting!\n");
        mouse_unsubscribe_int();
        return -1;
    }
    int r,ipc_status;
    message msg;


    bool reached_last_state =false;
    while(!reached_last_state) { /* You may want to use a different condition */
    /* Get a request message. */
        if ( (r = driver_receive(ANY, &msg, &ipc_status)) != 0 ) { 
            printf("driver_receive failed with: %d", r);
            continue;
        }
        if (is_ipc_notify(ipc_status)) { /* received notification */
        switch (_ENDPOINT_P(msg.m_source)) {
            case HARDWARE: /* hardware interrupt notification */				
            if (msg.m_notify.interrupts & irq_set) { /* subscribed interrupt */
                timer_counter = 0;
                mouse_ih();
                if (ready){
                    mouse_print_packet(&p);
                    reached_last_state= mouse_gesture_state_mach(&p,x_len,tolerance);
                    ready = false;
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
    mouse_unsubscribe_int();
    mouse_disable_data_reporting();
    return 0;
}

int (mouse_test_remote)(uint16_t period, uint8_t cnt) {
    /* This year you need not implement this. */
    printf("%s(%u, %u): under construction\n", __func__, period, cnt);
    return 1;
}

