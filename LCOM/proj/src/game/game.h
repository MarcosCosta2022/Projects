#ifndef GAME_H
#define GAME_H


#include <lcom/lcf.h>

//its best to put every typedef here cause it causes problems when you put it in other files
typedef enum{MENU , GAME , HISTORY , CHOOSE_NAME, EXIT, WINNER} Fase;
typedef enum {WHITE_NAME, BLACK_NAME, NO_NAME} Name;
typedef enum {WHITE,BLACK,COLORLESS} Color;
typedef struct {
    int x;
    int y;
    int row;
    int col;
    Color color;
    bool isKing;
    xpm_image_t* image;
    bool isCaptured;
}Piece;
typedef struct {
    int start_row;
    int start_col;
    int end_row;
    int end_col;
    Piece* piece_captured;
} Move;

typedef struct {
    Piece* piece ;
    Move moves[8] ;
    int num_moves ;
    bool isCapturing;
} Trajectory;

typedef struct{
    Piece* piece;
    int destination_x;
    int destination_y;
    int velocity_x;
    int velocity_y;
}PieceSprite;

extern PieceSprite sprites[24];
extern int num_sprites;

//before these
#include "board.h"
#include "draw_graphics.h"
#include "history.h"
#include "../devices/rtc.h"


extern int cursor_x;
extern int cursor_y;
extern Name name;

extern Fase fase;

extern Color turn;

extern Color winner;
extern char black_name[11];
extern char white_name[11];

extern int black_score;
extern int white_score;

extern int white_time;
extern int black_time;

/**
 * @brief Switches the turn
*/
void switchTurn();

/** @brief Changes the state of the game
 *  @param new_fase state to chenge to
 */ 
void (changeState)(Fase new_fase);

/**
 *  @brief Initializes the winner
 */
void (init_winner)();
/**
 * @brief Destroys the sprites
 */
void (destroy_sprites)();

#endif
