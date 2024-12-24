#ifndef  _HISTORY_H_
#define  _HISTORY_H_

#include "game.h"
#include "../devices/rtc.h"
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

typedef struct{
    char black_player_name[20];
    char white_player_name[20];
    Color winner;
    Time start_time;
    long int black_remain_time;
    long int white_remain_time;
} MatchRecord;

extern int num_matches;
extern MatchRecord history[30]; //only saves up to 30 matches
extern int index_first_match_being_shown;

/**
 * @brief Loads the history from the file
 */
void load_history();

/**
 * @brief Saves the history to the file
 */
void save_history();

/**
 * @brief Saves a match record
 * @param winner the winner of the match
 * @param black_remain_time the remaining time of the black player
 * @param white_remain_time the remaining time of the white player
 * @param black_name the name of the black player
 * @param white_name the name of the white player
 * @param start_time the time the match started
 */
void save_match_record(Color winner, long int black_remain_time, long int white_remain_time , char* black_name, char* white_name , Time start_time);

/**
 * @brief Gets a match record
 * @param index the index of the match record
 * @return the match record
 */
MatchRecord* getMatchRecord(int index);

/**
 * @brief Rolls down the history
 */
void (roll_down)();

/**
 * @brief Rolls up the history
 */
void (roll_up)();

#endif // _HISTORY_H_
