#include "draw_graphics.h"


xpm_image_t cursor,white_king,white_checker,black_king,black_checker,menu,font,result_screen,game_side_bar, 
        name_screen , history_screen, record;

//functions to draw checkers
HouseDraw board_to_draw[8][8];



void draw_graphics(void){
    switch (fase){
        case MENU:
            draw_menu();
            break;
        case GAME:
            draw_board();
            draw_checkers();
            break;
        case HISTORY:
            draw_history();
            break;
        case EXIT:
            break;
        case WINNER:
            draw_result_screen();
            break;
        case CHOOSE_NAME:
            draw_name_screen();
            break;
    }
    draw_cursor();
}

void draw_history(){
    video_draw_xpm(0, 0, &history_screen);

    //hide buttons that are useless
    if (index_first_match_being_shown <= 0){
        //conceal the down button
        vg_draw_rectangle(725,428,65,70,0x374D38);
    }
    if (index_first_match_being_shown >= num_matches - 3){
        //conceal the up button
        vg_draw_rectangle(725,174,65,70,0x374D38);
    }
    int numberOfMatchesShown = 3;
    if (num_matches < 3) numberOfMatchesShown = num_matches;
    int i  = numberOfMatchesShown -1;
    for(; i >= 0; i--){
        int x = 27;
        int y = 97 +166*(numberOfMatchesShown -1 -i);
        int index = index_first_match_being_shown + i;
        MatchRecord* record_info = getMatchRecord(index);
        if (record_info == NULL) break;
        video_draw_xpm(x,y ,&record);

        //write names
        draw_string(record_info->white_player_name, x+128,y+20, 0, 3);
        draw_string(record_info->black_player_name, x+128,y+60, 0, 3);

        //write winner
        if(record_info->winner == WHITE){
            draw_string(record_info->white_player_name, x+128,y+100, 0, 3);
        }else if(record_info->winner == BLACK){
            draw_string(record_info->black_player_name, x+128,y+100, 0, 3);
        }else{
            draw_string("DRAW", x+128,y+100, 0, 3);
        }
        
        //write date
        char date[20];
        sprintf(date, "%02d/%02d/%02d", record_info->start_time.day, record_info->start_time.month, record_info->start_time.year);
        draw_string(date, x+434,y+100, 0, 3);
    }
}

void (draw_result_screen)(){
    video_draw_xpm(0, 0, &result_screen);
    if (winner == COLORLESS){
        draw_string("DRAW", 320, 200, 0, 5);
    }
    else if (winner == WHITE){
        draw_string("WHITE WINS", 240, 170, 0xffffff, 4);
        draw_string(white_name, 200, 250, 0xffffff, 5);
    }
    else if (winner == BLACK){
        draw_string("BLACK WINS", 240, 170, 0, 4);
        draw_string(black_name, 200, 250, 0, 5);
    }

    // draw sprites

    for (int i = 0; i < num_sprites; i++){
        PieceSprite* sprite = &sprites[i];
        draw_checker(sprite->piece);
    }
}

void draw_menu(){
    video_draw_xpm(0, 0, &menu);
}

void draw_name_screen() {
    video_draw_xpm(0, 0, &name_screen);
    draw_string(white_name, 250, 225, 0, 5);
    draw_string(black_name, 250, 381, 0xffffff, 5);
}

void update_draw_board(){
    for (int i = 0 ; i < 8 ; i++){
        for (int j = 0 ; j < 8 ; j++){
            board_to_draw[i][j] = EMPTY;
        }
    }
    if (selected_piece == NULL) return;
    board_to_draw[selected_piece->row][selected_piece->col] = SELECTED;
    for (int i = 0 ;i<num_moves;i++){
        Trajectory* t = &all_moves[i];
        
        if ( t->piece!= selected_piece) continue;
        for (int j = 0; j < t->num_moves; j++){
            Move* m = &t->moves[j];
            if (m->piece_captured != NULL){
                board_to_draw[m->piece_captured->row][m->piece_captured->col] = CAPTURE;
            }
            board_to_draw[m->end_row][m->end_col] = PATH;
        }
        Move* m = &t->moves[t->num_moves-1];
        board_to_draw[m->end_row][m->end_col] = MOVE;
        
    }

}

void draw_board(void){
    video_draw_xpm(0, 0, &game_side_bar);
    int i, j;
    int sideLength = 600/8;
    int offset = 200;
    for(i = 0; i < 8; i++){
        for(j = 0; j < 8; j++){
            if((i + j) % 2 == 0){
                vg_draw_rectangle(i * sideLength + offset, j * sideLength, sideLength, sideLength,0xeeeed2);
            }else{
                long color;
                switch(board_to_draw[j][i]){
                    case EMPTY:color = 0x769656;break;
                    case SELECTED: color = 0xff0000; break;
                    case CAPTURE: color = 0xff0000; break;
                    case MOVE: color = 0x0000ff; break;
                    case PATH: color = 0x000000; break;
                }
                vg_draw_rectangle(i * sideLength + offset, j * sideLength,sideLength,sideLength,color);
            }
        }
    }


    //draw scores
    int x;
    char score[10];

    sprintf(score, "%d", black_score);
    if (black_score > 9) x = 150;
    else x = 165;
    draw_string(score, x,265, 0, 3);

    if (white_score > 9) x = 150;
    else x = 165;
    sprintf(score, "%d", white_score);
    draw_string(score, x, 315, 0, 3);

    //draw time

    int seconds = (black_time +59)/60;
    int minutes = seconds/60;
    seconds = seconds%60;
    sprintf(score, "%02d:%02d", minutes, seconds);
    draw_string(score, 80, 10, 0, 3);

    seconds = (white_time +59)/60;
    minutes = seconds/60;
    seconds = seconds%60;
    sprintf(score, "%02d:%02d", minutes, seconds);
    draw_string(score, 80, 570, 0, 3);


    //write names
    int white_name_color;
    int black_name_color;
    if (turn == WHITE){
        white_name_color = TURN_COLOR;
        black_name_color = NOT_TURN_COLOR;
    }
    else{
        white_name_color = NOT_TURN_COLOR;
        black_name_color = TURN_COLOR;
    }

    draw_string(white_name , 30 , 100 , white_name_color , 2);
    draw_string (black_name , 30 , 500 , black_name_color,2);
}

void (_update_screen)(void){
    update_screen();
}

void (load_xpms)(){
    xpm_load(cursor_xpm, XPM_8_8_8_8, &cursor);
    xpm_load(white_queen_xpm , XPM_8_8_8_8, &white_king);
    xpm_load(white_checker_xpm , XPM_8_8_8_8, &white_checker);
    xpm_load(black_queen_xpm , XPM_8_8_8_8, &black_king);
    xpm_load(black_checker_xpm , XPM_8_8_8_8, &black_checker);
    xpm_load(menu_xpm , XPM_8_8_8_8, &menu);
    xpm_load(font_xpm , XPM_8_8_8_8, &font);
    xpm_load(result_screen_xpm , XPM_8_8_8_8, &result_screen);
    xpm_load(game_side_bar_xpm , XPM_8_8_8_8, &game_side_bar);
    xpm_load(name_screen_xpm, XPM_8_8_8_8, &name_screen);
    xpm_load(history_xpm, XPM_8_8_8_8, &history_screen);
    xpm_load(record_xpm, XPM_8_8_8_8, &record);
}

void draw_checkers(void){
    int i;
    for(i = 0; i < 24; i++){
        if(pieces[i] != NULL && pieces[i] != selected_piece && !pieces[i]->isCaptured){
            draw_checker(pieces[i]);
        }
    }
    if(selected_piece != NULL){
        draw_checker(selected_piece);
    }
}

void (draw_checker)(Piece *piece){
    video_draw_xpm(piece->x, piece->y, piece->image);
}

void draw_cursor(void){
    video_draw_xpm(cursor_x, cursor_y, &cursor);
}

void (draw_string)(const char* str,int x , int y , int color,int scale){
    int i = 0;
    while (str[i] != '\0'){
        draw_character(str[i],x + i*8*scale,y,color,scale);
        i++;
    }
}


void (draw_character)(const char c,int x , int y , int color,int scale){
    if (c == ' ') return;

    uint16_t index;
    if (c >= '0' && c <= '9')index = c - '0';
    else if (c >= 'A' && c <= 'Z')index = c - 'A' + 17;
    else if (c >= 'a' && c <= 'z') index = c - 'a' + 17;
    else if ( c == ':')index = 10;
    else if (c == '<') index = 12;
    else if ( c == '=') index = 13;
    else if (c == '>') index = 14;
    else if (c == '?') index = 15;
    else if (c == '!') index = 11;
    else if (c == '@') index = 16;
    else if (c == '[') index = 43;
    else if (c == '\\') index = 44;
    else if (c == ']') index = 45;
    else if (c == '^')index = 46;
    else if (c == '/') index = 47;
    else return;

    vg_draw_character(&font, index , x , y , color,scale);
}



