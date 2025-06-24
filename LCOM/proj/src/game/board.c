#include "board.h"



Piece* board[8][8];

Piece* pieces[24];

Piece* selected_piece = NULL;

Trajectory all_moves[150];
int num_moves;
int captures = 0;

void destroy_board(){
    int i;
    for(i = 0; i < 24; i++){
        if(pieces[i] != NULL){
            free(pieces[i]);
        }
    }
}

bool isGameOver(){
    return num_moves == 0;
}

Trajectory* add_trajectory(){
    if (num_moves >= 150) {
        return &all_moves[0];
    }
    Trajectory* trajectory = &all_moves[num_moves];
    trajectory->num_moves = 0;
    trajectory->piece = NULL;
    trajectory->isCapturing = false;
    num_moves++;
    return trajectory;
}

Trajectory* add_trajectory_copy(Trajectory* trajectory){
    Trajectory* new_trajectory = add_trajectory();
    new_trajectory->piece = trajectory->piece;
    new_trajectory->num_moves = trajectory->num_moves;
    new_trajectory->isCapturing = trajectory->isCapturing;
    for (int i = 0; i < trajectory->num_moves; i++)
        new_trajectory->moves[i] = trajectory->moves[i];
    return new_trajectory;
}

Trajectory* add_trajectory_piece(Piece* piece){
    Trajectory* new_trajectory = add_trajectory();
    new_trajectory->piece = piece;
    return new_trajectory;
}

Move* add_move(Trajectory* t) {
    if (t->num_moves >= 8) {
        return &t->moves[0];
    }
    Move* move = &t->moves[t->num_moves];
    move->end_row = 0;
    move->end_col = 0;
    move->piece_captured = NULL;
    t->num_moves++;
    return move;
}

void remove_move(Trajectory* t) {
    t->num_moves--;
}

Trajectory* getTrajectory(Piece* piece, int end_row, int end_col) {
    for (int i = 0; i < num_moves; i++) {
        Trajectory* t = &all_moves[i];
        if (t->piece == piece && t->moves[t->num_moves-1].end_row == end_row && t->moves[t->num_moves-1].end_col == end_col) {
            return t;
        }
    }
    return NULL;
}

void calculate_moves() {
    // Clear all previous moves
    num_moves = 0;
    captures = 0;

    // Loop over all squares on the board
    int off = 0;
    if (turn == WHITE) {
        off = 12;
    }
    
    for (int i = 0; i < 12; i++) {
        Piece* piece = pieces[i + off];
        if (piece->isCaptured) {
            continue;  // This piece is captured, so skip it
        }
        Trajectory t;
        t.piece = piece;
        t.isCapturing = false;
        t.num_moves = 0;
        calculate_piece_moves(&t);
    }
    
}

int current_row(Trajectory* t) {
    if (t->num_moves == 0) {
        return t->piece->row;
    }
    return t->moves[t->num_moves-1].end_row;
}

int current_col(Trajectory* t) {
    if (t->num_moves == 0) {
        return t->piece->col;
    }
    return t->moves[t->num_moves-1].end_col;
}

bool insideBoard(int row, int col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

bool hasPiece(int row, int col) {
    return board[row][col] != NULL;
}

bool hasEnemyPiece(int row ,int col , Color c){
    if(board[row][col] != NULL){
        if(board[row][col]->color != c){
            return true;
        }
    }
    return false;
}

bool hasAlliedPiece(int row ,int col , Color c){
    if(board[row][col] != NULL){
        if(board[row][col]->color == c){
            return true;
        }
    }
    return false;
}

void clear_trajectories(){
    num_moves = 0;
}

void calculate_piece_moves(Trajectory* t) {
    
    if (!t->isCapturing && t->num_moves >0){
        add_trajectory_copy(t);
        return;
    }

    bool isComplete = true;
    Piece *piece = t->piece;

    int row = current_row(t);
    int col = current_col(t);

    

    if (piece->isKing){
        for (int i = 0 ; i < 4 ; i++){
            int dy = (i % 2 == 0) ? 1 : -1;
            int dx = (i < 2) ? 1 : -1;
            // Check for capturing moves to the bottom-left
            int new_row = row + dy;
            int new_col = col + dx;
            Piece* captured_piece = NULL;
            while(insideBoard(new_row,new_col) && !hasAlliedPiece(new_row,new_col,piece->color) && captured_piece == NULL){
                if (hasEnemyPiece(new_row,new_col,piece->color)){
                    captured_piece = board[new_row][new_col];
                }
                new_row += dy;
                new_col += dx;
            }
            if (captured_piece == NULL){
                continue;
            }

            //backtracking
            board[captured_piece->row][captured_piece->col] = NULL;
            Move* move = add_move(t);
            move->start_row = row;
            move->start_col = col;
            move->piece_captured = captured_piece;
            while(insideBoard(new_row,new_col) && !hasPiece(new_row,new_col)){
                isComplete = false;
                t->isCapturing = true;

                move->end_row = new_row;
                move->end_col = new_col;

                calculate_piece_moves(t);

                new_row += dy;
                new_col += dx;
            }
            board[captured_piece->row][captured_piece->col] = captured_piece;
            remove_move(t);
        }
    }
    else { //isnt king
        int delta = (piece->color == WHITE) ? -1 : 1;
        // Check for capturing moves to the left
        int new_row = row + delta;
        int new_col = col - 1;
        int dest_row = row + 2 * delta;
        int dest_col = col - 2;
        if (insideBoard(dest_row,dest_col) && hasEnemyPiece(new_row,new_col,piece->color) && !hasPiece(dest_row,dest_col)){
            isComplete = false;
            t->isCapturing = true;
            Piece* captured_piece = board[new_row][new_col];
            board[captured_piece->row][captured_piece->col] = NULL;
            Move* move = add_move(t);
            move->start_row = row;
            move->start_col = col;
            move->end_row = dest_row;
            move->end_col = dest_col;
            move->piece_captured = captured_piece;
            calculate_piece_moves(t);
            board[captured_piece->row][captured_piece->col] = captured_piece;
            remove_move(t);
        }

        // Check for capturing moves to the right
        new_row = row + delta;
        new_col = col + 1;
        dest_row = row + 2 * delta;
        dest_col = col + 2;

        if (insideBoard(dest_row,dest_col) && hasEnemyPiece(new_row,new_col,piece->color) && !hasPiece(dest_row,dest_col)){
            isComplete = false;
            t->isCapturing = true;
            Piece* captured_piece = board[new_row][new_col];
            board[captured_piece->row][captured_piece->col] = NULL;
            Move* move = add_move(t);
            move->start_row = row;
            move->start_col = col;
            move->end_row = dest_row;
            move->end_col = dest_col;
            move->piece_captured = captured_piece;
            calculate_piece_moves(t);
            board[captured_piece->row][captured_piece->col] = captured_piece;
            remove_move(t);
        }
    }
    
    

    // Check for non-capturing moves
    if (!t->isCapturing && captures == 0){
        if (piece->isKing){
            for (int i = 0 ; i < 4 ; i++){
                int dy = (i % 2 == 0) ? 1 : -1;
                int dx = (i < 2) ? 1 : -1;
                int new_row = row + dy;
                int new_col = col + dx;
                Move* move = add_move(t);
                move->start_row = row;
                move->start_col = col;
                while(insideBoard(new_row,new_col) && !hasPiece(new_row,new_col)){
                    isComplete = false;
                    move->end_row = new_row;
                    move->end_col = new_col;
                    calculate_piece_moves(t);
                    new_row += dy;
                    new_col += dx;
                }
                remove_move(t);
            }
        }
        
        else{
            int delta = (piece->color == WHITE) ? -1 : 1;
            int new_row = row + delta;
            int new_col = col - 1;
            if (insideBoard(new_row,new_col) && !hasPiece(new_row,new_col)){
                isComplete = false;
                Move* move = add_move(t);
                move->start_row = row;
                move->start_col = col;
                move->end_row = new_row;
                move->end_col = new_col;
                calculate_piece_moves(t);
                remove_move(t);
            }
            new_row = row + delta;
            new_col = col + 1;
            if (insideBoard(new_row,new_col) && !hasPiece(new_row,new_col)){
                isComplete = false;
                Move* move = add_move(t);
                move->start_row = row;
                move->start_col = col;
                move->end_row = new_row;
                move->end_col = new_col;
                calculate_piece_moves(t);
                remove_move(t);
            }
        }
        
    }

    if (isComplete && t->num_moves > 0){
        if (t->isCapturing && t->num_moves > captures){
            captures = t->num_moves;
            clear_trajectories();
        }
        if (t->isCapturing && t->num_moves == captures){
            add_trajectory_copy(t);
        }
        else if (captures == 0){
            add_trajectory_copy(t);
        }
    }
}

void init_board(){
    white_time = 10 * 60 * 60;
    black_time = 10 * 60 * 60; 
    white_score = 0;
    black_score = 0;
    turn = WHITE;
    captures = 0;
    num_moves = 0;
    selected_piece = NULL;
    int i, j;
    for(i = 0; i < 8; i++){
        for(j = 0; j < 8; j++){
            board[i][j] = NULL;
        }
    }
    for(i = 0; i < 24; i++){
        pieces[i] = NULL;
    }
    int index = 0;
    for(i = 0; i < 3; i++){
        for(j = 0; j < 8; j++){
            if((i + j) % 2 == 1){
                board[i][j] = createPiece(j * 600/8 + 200, i * 600/8, i, j, BLACK, false, &black_checker);
                pieces[index] = board[i][j];
                index++;
            }
        }
    }

    for(i = 5; i < 8; i++){
        for(j = 0; j < 8; j++){
            if((i + j) % 2 == 1){
                board[i][j] = createPiece(j * 600/8 +200, i * 600/8, i, j, WHITE, false, &white_checker);
                pieces[index] = board[i][j];
                index++;
            }
        }
    }
    calculate_moves();
}

void capturePieces(Trajectory* t){
    if (t->isCapturing){
        for(int i = 0 ; i < t->num_moves ; i++){
            Move* move = &t->moves[i];
            if (turn == WHITE) white_score++;
            else black_score++;
            if (move->piece_captured != NULL){
                move->piece_captured->isCaptured = true;
                board[move->piece_captured->row][move->piece_captured->col] = NULL;
            }
        }
    }
}



