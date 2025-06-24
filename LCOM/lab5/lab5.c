// IMPORTANT: you must include the following line in all your C files
#include <lcom/lcf.h>

#include <lcom/lab5.h>

#include <stdint.h>
#include <stdio.h>

// Any header files included below this line should have been created by you
#include "video.h"
#include "../lab3/keyboard.h"

int main(int argc, char *argv[]) {
  // sets the language of LCF messages (can be either EN-US or PT-PT)
  lcf_set_language("EN-US");

  // enables to log function invocations that are being "wrapped" by LCF
  // [comment this out if you don't want/need it]
  lcf_trace_calls("/home/lcom/labs/lab5/trace.txt");

  // enables to save the output of printf function calls on a file
  // [comment this out if you don't want/need it]
  lcf_log_output("/home/lcom/labs/lab5/output.txt");

  // handles control over to LCF
  // [LCF handles command line arguments and invokes the right function]
  if (lcf_start(argc, argv))
    return 1;

  // LCF clean up tasks
  // [must be the last statement before return]
  lcf_cleanup();

  return 0;
}

extern int timer_counter;
int(video_test_init)(uint16_t mode, uint8_t delay) {
  uint8_t hook_id;
  if (timer_subscribe_int(&hook_id)) return 1;
  int irq_set = BIT(hook_id);

  int r, ipc_status;
  message msg;
  video_change_mode(mode);
  long time = delay*60;
  while(timer_counter < time) { 
    if ( (r = driver_receive(ANY, &msg, &ipc_status)) != 0 ) { 
      printf("driver_receive failed with: %d", r);
      continue;
    }
    if (is_ipc_notify(ipc_status)) { /* received notification */
      switch (_ENDPOINT_P(msg.m_source)) {
        case HARDWARE: /* hardware interrupt notification */				
          if (msg.m_notify.interrupts & irq_set) { /* subscribed interrupt */
            timer_int_handler();
          }
          break;
        default:
          break;
      }
    }else{     
    }
  }
  int error = 0;
  if (video_exit() != OK) error = 1;
  timer_unsubscribe_int();
  return error;
}

int(video_test_rectangle)(uint16_t mode, uint16_t x, uint16_t y,uint16_t width, uint16_t height, uint32_t color) {
  if (vg_init(mode) == NULL) return 1;

  vg_draw_rectangle(x, y, width, height, color);

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
  if (video_exit() != OK) return 1;
  return 0;
}

int(video_test_pattern)(uint16_t mode, uint8_t no_rectangles, uint32_t first, uint8_t step) {
  if (vg_init(mode) == NULL) return 1;

  video_draw_pattern(no_rectangles, first, step);


  //leave when press ESC
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
  if (video_exit() != OK) return 1;
  return 0;
}

int(video_test_xpm)(xpm_map_t xpm, uint16_t x, uint16_t y) {
  if (vg_init(0x105) == NULL) return 1;

  xpm_image_t img;
  uint8_t* sprite = xpm_load(xpm,XPM_INDEXED,&img);
  if (sprite == NULL) return 1;

  video_draw_xpm(x,y,&img);

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
  if (video_exit() != OK) return 1;
  return 0;
}

int(video_test_move)(xpm_map_t xpm, uint16_t xi, uint16_t yi, uint16_t xf, uint16_t yf,int16_t speed, uint8_t fr_rate) {
  if (speed == 0) return 1;
  
  if (vg_init(0x105) == NULL) return 1;

  xpm_image_t img;
  uint8_t* sprite = xpm_load(xpm,XPM_INDEXED,&img);
  if (sprite == NULL) return 1;


  uint8_t hook_id;
  if (timer_subscribe_int(&hook_id)) return 1;
  int irq_set = BIT(hook_id);
  bool unsubscribe_timer = false;
  
  uint8_t hook_id2;
  if (kbd_subscribe_int(&hook_id2)) return 1;
  int irq_set2 = BIT(hook_id2);

  int r, ipc_status;
  message msg;
  timer_counter = 0;
  bool finished = false;

  while(!finished) {
    if ( (r = driver_receive(ANY, &msg, &ipc_status)) != 0 ) { 
      printf("driver_receive failed with: %d", r);
      continue;
    }
    if (is_ipc_notify(ipc_status)) { /* received notification */
      switch (_ENDPOINT_P(msg.m_source)) {
        case HARDWARE: /* hardware interrupt notification */				
          if (msg.m_notify.interrupts & irq_set) { /* subscribed interrupt */
            if (xi == xf && yi == yf){
              timer_unsubscribe_int();
              unsubscribe_timer = true;
              break;
            }
            timer_int_handler();
            if (timer_counter % (60 / fr_rate) == 0){
              if (speed > 0){
                timer_counter = 0;
                vg_draw_rectangle(xi,yi,img.width,img.height,0);
                if (xi < xf){
                  xi += speed;
                  if (xi > xf) xi = xf;
                }
                else if (xi > xf){
                  xi -= speed;
                  if (xi < xf) xi = xf;
                }
                if (yi < yf){
                  yi += speed;
                  if (yi > yf) yi = yf;
                }
                else if (yi > yf){
                  yi -= speed;
                  if (yi < yf) yi = yf;
                }
                video_draw_xpm(xi,yi,&img);
              }
              else if (timer_counter / (60 / fr_rate) % speed == 0){
                timer_counter = 0;
                vg_draw_rectangle(xi,yi,img.width,img.height,0);
                if (xi<xf) xi++;
                else if (xi>xf) xi--;
                if (yi<yf) yi++;
                else if (yi>yf) yi--;
                video_draw_xpm(xi,yi,&img);
              }
            }
          }
          else if (msg.m_notify.interrupts & irq_set2) { /* subscribed interrupt */
            kbc_ih();
            if (kbc_output == ESC_BREAK_CODE) finished = true;
          }
          break;
        default:
          break;
      }
    }else{     
    }
  }
  kbd_unsubscribe_int();
  if (!unsubscribe_timer) timer_unsubscribe_int();
  if (video_exit() != OK) return 1;
  return 0;
}

int(video_test_controller)() {
  reg86_t r86;
  memset(&r86, 0, sizeof(r86));	/* zero the structure */
  struct vg_vbe_contr_info vbe_info;
  if (vbe_get_controller_info(&vbe_info) != OK) return 1;
  vg_display_vbe_contr_info(&vbe_info);
  return 0;
}
