#ifndef DRAW_GRAPHICS_H
#define DRAW_GRAPHICS_H

#include <lcom/lcf.h>

typedef enum{
    EMPTY,
    SELECTED,
    CAPTURE,
    MOVE,
    PATH
}HouseDraw;

typedef struct{
    xpm_image_t* frames[10];
    int num_frames;
    int current_frame;
    int frame_duration;
    int current_duration;
    int x;
    int y;
}Animation;

#include "../devices/video.h"
#include "game.h"
#include "../resources/imgs/cursor.xpm"
#include "../resources/imgs/white_checker.xpm"
#include "../resources/imgs/black_checker.xpm"
#include "../resources/imgs/white_queen.xpm"
#include "../resources/imgs/black_queen.xpm"
#include "../resources/imgs/menu.xpm"
#include "../resources/imgs/font.xpm"
#include "../resources/imgs/result_screen.xpm"
#include "../resources/imgs/game_side_bar.xpm"
#include "../resources/imgs/name_screen.xpm"
#include "../resources/imgs/history.xpm"
#include "../resources/imgs/record.xpm"
#include "board.h"
#include "piece.h"
#include <libgen.h>

#define TURN_COLOR 0xFF8C00 //orange
#define NOT_TURN_COLOR 0xffffff //white

extern xpm_image_t cursor,white_king,white_checker,black_king,black_checker,font,menu,game_side_bar, name_screen;
extern HouseDraw board_to_draw[8][8];

/**
 * @brief Draws the history screen
 */
void draw_history();

/**
 * @brief Draws the menu
 */
void draw_menu();

/**
 * @brief Draws the name screen
 */
void draw_name_screen();

/**
 * @brief Loads the xpms
 */
void (load_xpms)();

/**
 * @brief Updates the screen
 */
void (_update_screen)(void);

/**
 * @brief Draws the graphics corresponding to the current state
 */
void draw_graphics(void);

/**
 * @brief Draws the game board
 */
void draw_board(void);

/**
 * @brief Draws the checkers
 */
void draw_checkers(void);

/**
 * @brief Draws a checker piece
 * @param piece Piece being drawn
 */
void (draw_checker)(Piece * piece);

/// @brief Draws the cursor
void draw_cursor(void);

/** 
 * @brief Updates the game board
 */
void update_draw_board();

/** @brief Draws a string
 * @param str string to be drawn
 * @param x x coordinate 
 * @param y y coordinate
 * @param color color of the string
 * @param scale size of the string
 */
void (draw_string)(const char* str,int x , int y , int color,int scale);

/**
 *  @brief Draws a character
 *  @param c character to be drawn
 *  @param x x coordinate
 *  @param y y coordinate
 *  @param color color of the character
 *  @param scale size of the character
 */ 
void (draw_character)(const char c,int x , int y , int color,int scale);

/** 
 * @brief Draws the result screen
 */
void (draw_result_screen)();

#endif

