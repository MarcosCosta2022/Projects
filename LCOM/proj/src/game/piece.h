#ifndef PIECE_H
#define PIECE_H

#include <lcom/lcf.h>
#include "board.h"
#include "game.h"

/**
 * @brief Create a Piece object
 * @param x x position
 * @param y y position
 * @param row row position
 * @param col column position
 * @param color color of the piece
 * @param isKing if the piece is a king
 * @param image image of the piece
 * @return Piece* pointer to the created piece 
 */
Piece* createPiece(int x, int y, int row, int col, Color color, bool isKing, xpm_image_t* image);

/**
 * @brief Makes a piece a king
 * @param piece Piece to promote
 */
void promote(Piece* piece);

/**
 * @brief Captures a piece
 * @param piece Piece being captured
 */
void capture(Piece* piece);

#endif
