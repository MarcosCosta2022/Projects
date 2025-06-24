#include "keyboard.h"


char keys[0x90];

int kbd_hook_id = 1;
int (kbd_subscribe_int)(uint8_t* bit_no){
    *bit_no = kbd_hook_id;
    return sys_irqsetpolicy(KBD_IRQ_LINE,IRQ_REENABLE | IRQ_EXCLUSIVE , &kbd_hook_id);
}

int (kbd_unsubscribe_int)(){
    return sys_irqrmpolicy(&kbd_hook_id);
}


uint8_t scan_code[2];
int kbd_i = 0;
bool kbd_ih_flag=false;
void (kbc_ih)(){
  uint8_t output;
  KBC_read_output(KBC_OUT_BUFF,&output);

  uint8_t st;
  KBC_get_status(&st);

  if (!(st & (PARITY_ERROR | TIMEOUT_ERROR))) {
    scan_code[kbd_i] = output;

    if (output != TWO_BYTES) {
      if (output & BIT(7)) {
        kbd_ih_flag = false;
      } else {
        kbd_ih_flag = true;
      }
    }

  }
}

int (kbd_restore)(){
    KBC_write_input(COMMAND_INTERACT,KBC_READ_CMD);
    uint8_t cmd_byte;
    KBC_read_output(KBC_OUT_BUFF,&cmd_byte);
    cmd_byte |= KBD_ENABLE_OBF_INT;
    KBC_write_input(COMMAND_INTERACT, KBC_WRITE_CMD);
    KBC_write_input(KBC_IN_BUFF , cmd_byte);
    return 0;
}
