#ifndef BOARD_H
#define BOARD_H

#include <lcom/lcf.h>
#include "game.h"

#include "piece.h"

extern Piece* board[8][8];

extern Piece* pieces[24];

extern Piece* selected_piece;

/**
 * @brief Initializes the board
 */
void init_board();

/**
 * @brief Destroys the board
 */
void destroy_board();

extern Trajectory all_moves[150];
extern int num_moves;
extern int captures;

/**
 * @brief Adds a trajectory to the array of trajectories
 * @return Added trajectory
 */
Trajectory* add_trajectory();
/**
 * @brief Adds a copy of a trajectory to the array of trajectories 
 * @param trajectory trajectory to copy
 * @return returns the added trajectory
 */
Trajectory* add_trajectory_copy(Trajectory* trajectory);

/**
 * @brief Adds a trajectory to an array of trajectories of a piece
 * @param piece piece to add
 * @return Added trajectory
 */
Trajectory* add_trajectory_piece(Piece* piece);
/**
 * @brief Adds a move to a trajectory
 * @param t Trajectory
 * @return Move* being added
 */
Move* add_move(Trajectory* t);
/**
 * @brief Removes a move from a trajectory
 * @param t trajectory
 */
void remove_move(Trajectory* t);
/**
 * @brief Calculates the moves of all the pieces
 */
void calculate_moves();
/**
 * @brief Returns the current row of a trajectory
 * @param t trajectory
 * @return Current row of the trajectory
 */
int current_row(Trajectory* t);
/**
 * @brief Returns the current column of a trajectory
 * @param t trajectory
 * @return Current column of the trajectory
 */
int current_col(Trajectory* t) ;
/**
 * @brief Checks if a position is inside the board
 * @param row row of the position
 * @param col column of the position
 * @return true if the position is inside the board, false otherwise
 */
bool insideBoard(int row, int col);
/**
 * @brief Checks if a piece exists in a position
 * @param row row of the piece
 * @param col column of the piece
 * @return true if the piece exists, false otherwise
 */
bool hasPiece(int row, int col);

/**
 * @brief Checks if a piece is an enemy
 * @param row row of the piece
 * @param col column of the piece
 * @param c color of the piece
 * @return true if the piece is an enemy, false otherwise
 */
bool hasEnemyPiece(int row ,int col , Color c);

/**
 * @brief Checks if a piece is allied
 * @param row row of the piece
 * @param col column of the piece
 * @param c color of the piece
 * @return true if the piece is allied, false otherwise
 */
bool hasAlliedPiece(int row ,int col , Color c);

/**
 * @brief Clears the trajectories
 */
void clear_trajectories();
/**
 * @brief Calculates the moves of a piece
 * @param t Trajectory to calculate the moves
 */
void calculate_piece_moves(Trajectory* t);

/**
 * @brief Get the Trajectory object
 * @param piece piece to get the trajectory
 * @param end_row row to end the trajectory
 * @param end_col column to end the trajectory
 * @return Trajectory* of the piece
 */
Trajectory* getTrajectory(Piece* piece, int end_row, int end_col);

/** 
 * @brief Captures the pieces in a trajectory
 * @param t Trajectory to capture the pieces
 */
void capturePieces(Trajectory* t);

/** 
 * @brief Checks if the game is over
 * @return true if the game is over, false otherwise
 */
bool isGameOver();

#endif
