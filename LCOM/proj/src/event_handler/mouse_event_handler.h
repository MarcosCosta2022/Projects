#ifndef MOUSE_EVENT_HANDLER_H 
#define MOUSE_EVENT_HANDLER_H

#include "../game/game.h"
#include "../devices/mouse.h"

/**
 * @brief Handles mouse events
 * @param pp pointer to the packet with the mouse event
 */
void (mouse_event_handler)(struct packet *pp);

/**
 * @brief Handles mouse movement
 * @param pp pointer to the packet with the mouse event
 */
void (move_cursor)(struct packet *pp);

/**
 * @brief Handles mouse left button pressed
 */
void (mouse_lb_pressed)();

/**
 * @brief Handles mouse left button pressed in game
 */
void (mouse_lb_pressed_game)(void);

/**
 * @brief Handles mouse left button released
 */
void (mouse_lb_released)();
/**
 * @brief Handles mouse left button pressed in name choosing menu
 */
void (mouse_lb_pressed_name)();
/**
 * @brief Handles mouse left button released in game
 */
void (mouse_lb_released_game)(void);
/**
 * @brief Moves a piece
 */
void (mouse_mov_piece)(struct packet *pp);

/**
 * @brief Attempts to move a piece
 * @param dest_row row to move to
 * @param dest_col column to move to
 * @return true if the move was successful
 */
bool attempt_move(uint8_t dest_row, uint8_t dest_col);

/**
 * @brief Handles mouse left button pressed in menu
 */
void (mouse_lb_pressed_menu)();
/**
 * @brief Moves a piece back to its original position
 * @param piece pointer to the piece to move back
 */
void (move_piece_back)(Piece *piece);

/**
 * @brief Handles mouse left button pressed in winner screen
*/
void (mouse_lb_pressed_winner)();

/**
 * @brief Handles mouse left button pressed in history screen
*/
void (mouse_lb_pressed_history)();

#endif
