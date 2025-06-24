#ifndef KBD_EVENT_HANDLER_H
#define KBD_EVENT_HANDLER_H

#include <lcom/lcf.h>
#include "../devices/keyboard.h"
#include "../game/game.h"

/**
 * @brief Handles keyboard events
 * @param scancode array with the scancode
 */
void(kbd_event_handler)(uint8_t scancode[2]); // only takes one byte scancode

#endif

