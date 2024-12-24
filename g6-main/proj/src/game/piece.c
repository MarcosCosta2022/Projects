#include "piece.h"


Piece* createPiece(int x, int y, int row, int col, Color color, bool isKing, xpm_image_t* image){
    Piece* piece = (Piece*) malloc(sizeof(Piece));
    piece->x = x;
    piece->y = y;
    piece->row = row;
    piece->col = col;
    piece->color = color;
    piece->isKing = isKing;
    piece->image = image;
    piece->isCaptured = false;
    return piece;
}

void promote(Piece* piece){
    piece->isKing = true;
    if(piece->color == WHITE){
        piece->image = &white_king;
    }
    else{
        piece->image = &black_king;
    }
}

void capture(Piece* piece){
    piece->isCaptured = true;
}


