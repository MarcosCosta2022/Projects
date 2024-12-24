#include <lcom/lcf.h>
#include <lcom/timer.h>

#include <stdint.h>

#include "i8254.h"

int (timer_set_frequency)(uint8_t timer, uint32_t freq) {
  if (freq < 19 || freq > TIMER_FREQ) return 1;

  uint8_t st;
  if (timer_get_conf(timer , &st) != OK) return 1;

  st &= TIMER_OPERATING_MODE;

  switch (timer){
    case 0: st |= TIMER_SEL0; break;
    case 1: st |= TIMER_SEL1; break;
    case 2: st |= TIMER_SEL2; break;
  }
  
  st |= TIMER_LSB_MSB;
  
  sys_outb(TIMER_CTRL, st);

  unsigned long count = TIMER_FREQ / freq;

  uint8_t lsb;
  uint8_t msb;
  if (util_get_LSB(count , &lsb)) return 1;
  if (util_get_MSB(count , &msb)) return 1;
  
  if (sys_outb(TIMER_N(timer), lsb)) return 1;
  if (sys_outb(TIMER_N(timer), msb)) return 1;

  return 0;
}

int timer_hook_id;
int (timer_subscribe_int)(uint8_t *bit_no) {
  *bit_no = timer_hook_id;
  return sys_irqsetpolicy(TIMER0_IRQ,IRQ_REENABLE,&timer_hook_id);
}

int (timer_unsubscribe_int)() {
  return sys_irqrmpolicy(&timer_hook_id);
}
int timer_counter = 0;
void (timer_int_handler)() {
  timer_counter ++;
}

int (timer_get_conf)(uint8_t timer, uint8_t *st) {
  uint8_t read_back_command = TIMER_RB_CMD | TIMER_RB_SEL(timer) | TIMER_RB_COUNT_ ;
  sys_outb(TIMER_CTRL, read_back_command);
  return util_sys_inb(TIMER_N(timer), st);
}

int (timer_display_conf)(uint8_t timer, uint8_t st,enum timer_status_field field) {
  union timer_status_field_val conf;
  // doenst make a difference but there u have it
  switch (field) {
    case tsf_all:
      conf.byte = st;
      break;
    case tsf_initial:
      if ((st & TIMER_LSB) && !(st & TIMER_MSB)) conf.in_mode = LSB_only;
      else if (!(st & TIMER_LSB) && (st & TIMER_MSB)) conf.in_mode = MSB_only;
      else if (st & TIMER_LSB_MSB) conf.in_mode = MSB_after_LSB;
      else conf.in_mode = INVAL_val;
      break;
    case tsf_mode:
      conf.count_mode = (st >> 1) & 7;
      if(conf.count_mode > 5 )conf.count_mode-=4;
      break;
    case tsf_base:
      conf.bcd = st&TIMER_BCD;
      break;
  }
  return timer_print_config(timer, field, conf);

}

