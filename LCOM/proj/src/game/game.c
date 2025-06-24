#include "game.h"

Fase fase = MENU;
Name name = NO_NAME;

int cursor_x = 400;
int cursor_y = 300;

Color turn = WHITE;
Color winner = COLORLESS;
char white_name[11] = "Player 1";
char black_name[11] = "Player 2";
int black_score = 0;
int white_score = 0;
int white_time = 10*60*60;
int black_time = 10*60*60;


void switchTurn(){
    if(turn == WHITE)turn = BLACK;
    else turn = WHITE;
}

void (changeState)(Fase new_fase){
    if (fase == GAME ) destroy_board();
    else if (fase == WINNER) destroy_sprites();
    fase = new_fase;
    if (fase == GAME) init_board();
    else if (fase == WINNER) init_winner();
    else if (fase == HISTORY) {
        index_first_match_being_shown = num_matches - 3;
        if (index_first_match_being_shown<0) index_first_match_being_shown = 0;
    }
}

PieceSprite sprites[24];
int num_sprites;

void (init_winner)(){
    save_match_record(winner, black_time, white_time, black_name, white_name, rtc_read_time());
    num_sprites = 0;
    Piece* black = createPiece(-85,150,0,0,BLACK,false,&black_checker);
    Piece* white = createPiece(810,150,0,0,WHITE,false,&white_checker);
    if (winner == WHITE) promote(white);
    else if (winner == BLACK) promote(black);

    sprites[num_sprites].piece = black;
    sprites[num_sprites].destination_x = 400-75;
    sprites[num_sprites].destination_y = 150;
    sprites[num_sprites].velocity_x = 30;
    sprites[num_sprites].velocity_y = 0;
    num_sprites++;
    sprites[num_sprites].piece = white;
    sprites[num_sprites].destination_x = 400;
    sprites[num_sprites].destination_y = 150;
    sprites[num_sprites].velocity_x = -30;
    sprites[num_sprites].velocity_y = 0;
    num_sprites++;

}

void (destroy_sprites)(){
    for (int i = 0; i < num_sprites; i++){
        PieceSprite* sprite = &sprites[i];
        free(sprite->piece);
    }
    num_sprites = 0;
}


