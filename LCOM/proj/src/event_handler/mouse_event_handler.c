#include "mouse_event_handler.h"

static bool rb = false, lb = false;

void mouse_event_handler(struct packet *pp){

    if (pp->rb != rb) {
        rb = pp->rb;
        //if (rb == true)mouse_rb_pressed();
        //else mouse_rb_released();
    }
    if (pp->lb != lb) {
        lb = pp->lb;
        if (lb == true)mouse_lb_pressed();
        else mouse_lb_released();
    }

    move_cursor(pp);
    mouse_mov_piece(pp);
}

void (move_cursor)(struct packet *pp){
    cursor_x += pp->delta_x;
    if (cursor_x < 0)
        cursor_x = 0;
    else if (cursor_x >= 800)
        cursor_x = 800;
    cursor_y -= pp->delta_y;
    if (cursor_y < 0)
        cursor_y = 0;
    else if (cursor_y > 600)
        cursor_y = 600;
}



void (mouse_lb_pressed)(){
    switch(fase){
        case MENU:
            mouse_lb_pressed_menu();
            break;
        case GAME:
            mouse_lb_pressed_game();
            break;
        case HISTORY:
            mouse_lb_pressed_history();
            break;
        case EXIT:
            break;
        case WINNER:
            mouse_lb_pressed_winner();
            break;
        case CHOOSE_NAME:
            mouse_lb_pressed_name();
            break;
    }
}

void (mouse_lb_pressed_history)(){
    if (cursor_x >= 18 && cursor_x <= 112 && cursor_y >= 17 && cursor_y <= 64){
        // pressed back button
        changeState(MENU);
    }
    else if (cursor_x >= 729 && cursor_x <= 781 && cursor_y >= 174 && cursor_y <= 217){
        // pressed up button
        roll_up();
    }
    else if (cursor_x >= 729 && cursor_x <=781 && cursor_y >= 433 && cursor_y <= 479){
        // pressed down button
        roll_down();
    }
}

void (mouse_lb_pressed_name)() {
    if (cursor_x >= 229 && cursor_x <= 734 && cursor_y >= 203 && cursor_y <= 296) {
        name = WHITE_NAME;
    }
    else if (cursor_x >= 229 && cursor_x <= 734 && cursor_y >= 359 && cursor_y <= 452) {
        name = BLACK_NAME;
    }
    else if (cursor_x >= 278 && cursor_x <= 522 && cursor_y >= 511 && cursor_y <= 586) {
        changeState(GAME);
    }
    else name = NO_NAME;
}

void (mouse_lb_pressed_winner)(){
    if (cursor_x >= 200 && cursor_x <= 600 && cursor_y >= 324 && cursor_y <= 404) {
        changeState(GAME);
    }
    else if (cursor_x >= 200 && cursor_x <= 600 && cursor_y >= 423 && cursor_y <= 503) {
        changeState(MENU);
    }
}

void (mouse_lb_pressed_menu)(){
    if (cursor_x >= 200 && cursor_x <= 600 && cursor_y >= 240 && cursor_y <= 320) {
        changeState(CHOOSE_NAME);
    }
    else if (cursor_x >= 200 && cursor_x <= 600 && cursor_y >= 340 && cursor_y <= 420) {
        changeState(HISTORY);
    }
    else if (cursor_x >= 200 && cursor_x <= 600 && cursor_y >= 450 && cursor_y <= 530) {
        changeState(EXIT);
    }
}



void (mouse_lb_pressed_game)(void){
    if (cursor_x < 200 || cursor_x > 800){ // not on the board at all
        if(cursor_x >=158 && cursor_x <= 194 && cursor_y >= 414 && cursor_y <=450){
            //white resigns
            winner = BLACK;
            changeState(WINNER);
        }
        else if (cursor_x >=158 && cursor_x <= 194 && cursor_y >= 150 && cursor_y <= 186){
            //black resigns
            winner = WHITE;
            changeState(WINNER);
        }
        else if (cursor_x >=0 && cursor_x <= 86 && cursor_y >= 281 && cursor_y <= 320){
            //draw
            winner = COLORLESS;
            changeState(WINNER);
        }
    }
    int cursor_current_row = cursor_y / 75;
    int cursor_current_col = (cursor_x-200)/75;

    Piece* p = board[cursor_current_row][cursor_current_col];
    if (p != NULL && p->color == turn){
        selected_piece = p;
        p->x = cursor_x - 40;
        p->y = cursor_y - 40;
        update_draw_board();
    }
    else if (p == NULL){
        attempt_move(cursor_current_row,cursor_current_col);
    }   
    else {
        selected_piece =NULL;
    }
}



void (mouse_lb_released)(){
    switch(fase){
        case MENU:
            break;
        case GAME:
            mouse_lb_released_game();
            break;
        case HISTORY:
            break;
        case EXIT:
            break;
        case WINNER:
            break;
        case CHOOSE_NAME:
            break;
    }
}

bool attempt_move(uint8_t dest_row, uint8_t dest_col){
    if ((dest_row + dest_col)%2 == 1 && insideBoard(dest_row,dest_col) && !hasPiece(dest_row,dest_col) ){
        Trajectory* trajectory = getTrajectory(selected_piece , dest_row,dest_col);
        if (trajectory != NULL){
            board[selected_piece->row][selected_piece->col] = NULL;
            selected_piece->col = dest_col;
            selected_piece->row = dest_row;
            move_piece_back(selected_piece);
            board[selected_piece->row][selected_piece->col] = selected_piece;
            if (!selected_piece->isKing && (selected_piece->row == 7 || selected_piece->row == 0)) {
                promote(selected_piece);
            }
            capturePieces(trajectory);
            switchTurn();
            calculate_moves();
            update_draw_board();
            if (isGameOver()){
                selected_piece = NULL;
                switchTurn();
                winner = turn;
                changeState(WINNER);
            }
            selected_piece = NULL;
            return true;
        }
        else {
            return false;
        }
    }
    else{
        return false;
    }
}

void (move_piece_back)(Piece *piece){
    if (piece == NULL) return;
    piece->x = piece->col*75 + 200;
    piece->y = piece->row*75;
}

void (mouse_lb_released_game)(void){
    if (selected_piece == NULL) return;
    if (selected_piece->x < 80 || selected_piece->x > 720 || selected_piece->y < -20 || selected_piece->y > 620) {
        move_piece_back(selected_piece);
        return;
    }
    int temp_x = (selected_piece->x + 33 - 200) /75;
    int temp_y = (selected_piece->y + 33) / 75;
    if (!attempt_move(temp_y,temp_x)) move_piece_back(selected_piece);
}



void (mouse_mov_piece)(struct packet *pp){
    if (selected_piece != NULL && lb) {
        selected_piece->x = cursor_x - 40;
        selected_piece->y = cursor_y - 40;
    }
}



