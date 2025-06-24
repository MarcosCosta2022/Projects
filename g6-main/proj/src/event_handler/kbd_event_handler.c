#include "kbd_event_handler.h"

void(kbd_event_handler)(uint8_t scancode[2]){
    if (scancode[0] != TWO_BYTES){
        if (scancode[0] == ESC_BREAK) {
            if (fase != MENU) {changeState(MENU);}
            else changeState(EXIT);
            return;
        }

        if (fase == CHOOSE_NAME) {
            if (scancode[0] >= 0x90) return;


            if (name == NO_NAME) return;
            char* name_selected;
            if (name == WHITE_NAME) name_selected = white_name;
            else name_selected = black_name;
            
            if (scancode[0] == BACKSPACE) {
                if (strlen(name_selected) == 0) return;
                name_selected[strlen(name_selected) - 1] = '\0';
                return;
            }

            char key = keys[scancode[0]];

            if (key == 0) return;
            if (key == ' ' && strlen(name_selected) == 0) return;

            for (int i = 0; i < 10; i++) {
                if (name_selected[i] == '\0') {
                    name_selected[i] = key;
                    name_selected[i + 1] = '\0';
                    break;
                }
            }
        }
    }
    else{
        if (fase == HISTORY){
            if (scancode[1] == UP_ARROW){
                roll_up();
            }
            else if (scancode[1] == DOWN_ARROW){
                roll_down();
            }
        }
    }
}



