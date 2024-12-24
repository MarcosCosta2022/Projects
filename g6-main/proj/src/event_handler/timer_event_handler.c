#include "timer_event_handler.h"

void timer_event_handler(void){
    if (fase == GAME){
        if (turn == WHITE) {
            white_time -=2;
            if (white_time == 0) {
                winner = BLACK;
                changeState(WINNER);
            }
        }
        else {
            black_time -=2;
            if (black_time == 0) {
                winner = WHITE;
                changeState(WINNER);
            }
        }
    }
    update_sprites();
    draw_graphics();
    _update_screen();
}

void (update_sprites)(){        
    for (int i = 0; i < num_sprites; i++){
        PieceSprite* sprite = &sprites[i];
        Piece* piece = sprite->piece;
        piece->x += sprite->velocity_x;
        piece->y += sprite->velocity_y;
        if (sprite->velocity_x > 0 && piece->x >= sprite->destination_x){
            piece->x = sprite->destination_x;
            sprite->velocity_x = 0;
        }
        else if (sprite->velocity_x < 0 && piece->x <= sprite->destination_x){
            piece->x = sprite->destination_x;
            sprite->velocity_x = 0;
        }
        if (sprite->velocity_y > 0 && piece->y >= sprite->destination_y){
            piece->y = sprite->destination_y;
            sprite->velocity_y = 0;
        }
        else if (sprite->velocity_y < 0 && piece->y <= sprite->destination_y){
            piece->y = sprite->destination_y;
            sprite->velocity_y = 0;
        }
        
    }
    if (fase == WINNER){
        if (sprites[0].velocity_x == 0 && sprites[1].velocity_x == 0){
            if (winner == BLACK){
                sprites[0].destination_x = 125;
                sprites[0].velocity_x = -15;

                sprites[1].destination_x = 810;
                sprites[1].velocity_x = 20;
            }
            else if (winner == WHITE){
                sprites[0].destination_x = -85;
                sprites[0].velocity_x = -20;

                sprites[1].destination_x = 600;
                sprites[1].velocity_x = 15;
            }
            else {
                sprites[0].destination_x = 125;
                sprites[0].velocity_x = -15;

                sprites[1].destination_x = 600;
                sprites[1].velocity_x = 15;
            }
        }
    }
}
