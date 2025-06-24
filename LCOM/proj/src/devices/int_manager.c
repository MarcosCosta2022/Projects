#include "int_manager.h"

//temporary
#include "../game/draw_graphics.h"

uint32_t timer_irq_set, kbd_irq_set, mouse_irq_set;


int(init)() {
  uint8_t timer_bit_no = 0, kbd_bit_no = 0,  mouse_bit_no =0;

  // enabling interrupts
  timer_subscribe_int(&timer_bit_no);
  kbd_subscribe_int(&kbd_bit_no);
  mouse_subscribe_int(&mouse_bit_no);
  mouse_enable_data_reporting_mv();

  timer_irq_set = BIT(timer_bit_no);
  kbd_irq_set = BIT(kbd_bit_no);
  mouse_irq_set = BIT(mouse_bit_no);

  // initialize vc
  vg_init(0x115);

  // loading xpms
  load_xpms();

  // initialize array of keys
  get_keys();

  //load history
  load_history();

  return EXIT_SUCCESS;
}

int(main_loop)() {
  message msg;
  int ipc_status;

  while (fase != EXIT) {

    int r;
    if ((r = driver_receive(ANY, &msg, &ipc_status)) != OK) {
      printf("driver_receive failed with: %d", r);
    }

    if (is_ipc_notify(ipc_status)) {
      switch (_ENDPOINT_P(msg.m_source)) {

        case HARDWARE: {
          if (msg.m_notify.interrupts & mouse_irq_set) {
            mouse_ih();
            if (mouse_ready) {
              mouse_ready = false;
              mouse_event_handler(&mouse_packet);
            }
          }
         else if (msg.m_notify.interrupts & kbd_irq_set) {
            kbc_ih();

            if (scan_code[kbd_i] == TWO_BYTES) {
              kbd_i++;
              continue;
            }
            kbd_i = 0;

            kbd_event_handler(scan_code);
            scan_code[0] = 0;
            scan_code[1] = 0;

          }
          else if (msg.m_notify.interrupts & timer_irq_set) {
            timer_int_handler();

            if (timer_counter % 2 == 0) {
              timer_event_handler();
            }
          }

          break;
        }

        default: break;
      }
    }
  }

  return EXIT_SUCCESS;
}

int(leave)() {
  save_history();
  timer_unsubscribe_int();
  kbd_unsubscribe_int();
  mouse_unsubscribe_int();
  mouse_disable_data_reporting();
  video_exit();

  return EXIT_SUCCESS;
}

