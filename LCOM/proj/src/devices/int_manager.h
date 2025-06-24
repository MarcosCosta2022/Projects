#ifndef INT_MANAGER_H
#define INT_MANAGER_H

#include <lcom/lcf.h>
#include <stdint.h>
#include "KBC.h"
#include "mouse.h"
#include "timer.h"
#include "video.h"
#include "keyboard.h"
#include "../event_handler/timer_event_handler.h"
#include "../event_handler/kbd_event_handler.h"
#include "../event_handler/mouse_event_handler.h"
#include "../game/draw_graphics.h"
#include "../game/game.h"
#include "../game/game_utils.h"
#include "../game/history.h"


extern bool running;

/**
 * @brief Function called at program start, enables interrupts, intializes videocard, loads xpms and initializes other important features
 * @return 0 if successful, 1 otherwise
 */
int (init)();

/**
 * @brief The main program execution loop, responsible for calling all of the needed functions to run the game and menus
 * @return 0 if successful, 1 otherwise
 */
int (main_loop)();

/**
 * @brief Function executed on program end, unsubscribes interrupts and overall resets MINIX to its' default mode
 * @return 0 if successful, 1 otherwise
 */
int (leave)();


#endif

