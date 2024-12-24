#include "history.h"

int num_matches  = 0;
MatchRecord history[30]; //only saves up to 30 matches
int oldest_match_index = 0;

int index_first_match_being_shown = 0;


void (roll_down)(){
    if (index_first_match_being_shown > 0) index_first_match_being_shown--;
}
void (roll_up)(){
    if (index_first_match_being_shown < num_matches - 3) index_first_match_being_shown++;
}

void save_match_record(Color winner, long int black_remain_time, long int white_remain_time , char* black_name, char* white_name , Time start_time){
    if(num_matches < 30){
        num_matches++;
    }
    history[oldest_match_index].winner = winner;
    history[oldest_match_index].black_remain_time = black_remain_time;
    history[oldest_match_index].white_remain_time = white_remain_time;
    history[oldest_match_index].start_time = start_time;
    strcpy(history[oldest_match_index].black_player_name, black_name);
    strcpy(history[oldest_match_index].white_player_name, white_name);
    oldest_match_index = (oldest_match_index + 1) % 30;
}

MatchRecord* getMatchRecord(int index){
    if(num_matches == 0 || index >= num_matches){
        return NULL;
    }
    if (num_matches < 30){
        return &history[index];
    }
    return &history[(oldest_match_index + index) % 30];
}

void load_history() {
    
    char file_dir[256]; // Store the directory containing the current file
    strcpy(file_dir, dirname(__FILE__));
    strcat(file_dir, "/../resources/history.csv");

    char real_file_dir[256];
    if (realpath(file_dir, real_file_dir) == NULL){
        printf("Failed to resolve the absolute path of the project root directory.\n");
        return;
    }
    FILE *file = fopen(real_file_dir, "r");
    if (file == NULL) {
        printf("Error opening file: %s\n", real_file_dir);
        return;
    }
    
    char buffer[256];
    fgets(buffer, sizeof(buffer), file); // Skip header
    
    while (fgets(buffer, sizeof(buffer), file)) {
        if (num_matches >= 30) {
            break;
        }
        
        char *token = strtok(buffer, ",");
        if (token == NULL) {
            break;
        }
        strncpy(history[num_matches].white_player_name, token, 20);
        
        token = strtok(NULL, ",");
        if (token == NULL) {
            break;
        }
        strncpy(history[num_matches].black_player_name, token, 20);
        
        token = strtok(NULL, ",");
        if (token == NULL) {
            break;
        }
        if (strcmp(token, "BLACK") == 0) {
            history[num_matches].winner = BLACK;
        } else if (strcmp(token, "WHITE") == 0) {
            history[num_matches].winner = WHITE;
        } else {
            break;
        }
        
        token = strtok(NULL, ",");
        if (token == NULL) {
            break;
        }
        sscanf(token, "%hu-%hu-%hu",
               &history[num_matches].start_time.year,
               &history[num_matches].start_time.month,
               &history[num_matches].start_time.day);
        
        token = strtok(NULL, ",");
        if (token == NULL) {
            break;
        }
        history[num_matches].black_remain_time = strtol(token, NULL, 10);
        
        token = strtok(NULL, ",");
        if (token == NULL) {
            break;
        }
        history[num_matches].white_remain_time = strtol(token, NULL, 10);
        

        num_matches++;
    }
    oldest_match_index = num_matches % 30;

    fclose(file);
}



void save_history() {
    char file_dir[256]; // Store the directory containing the current file
    strcpy(file_dir, dirname(__FILE__));
    strcat(file_dir, "/../resources/history.csv");

    char real_file_dir[256];
    if (realpath(file_dir, real_file_dir) == NULL){
        printf("Failed to resolve the absolute path of the project root directory.\n");
        return;
    }
    FILE *file = fopen(real_file_dir, "w");
    if (file == NULL) {
        printf("Error opening file: %s\n", real_file_dir);
        return;
    }
    
    fprintf(file, "White Player,Black Player,Winner,Start Time,Black Remaining Time,White Remaining Time\n");
    
    for (int i = 0; i < num_matches; i++) {
        fprintf(file, "%s,%s,%s,%hu-%hu-%hu,%ld,%ld\n",
                history[i].white_player_name,
                history[i].black_player_name,
                history[i].winner == BLACK ? "BLACK" : "WHITE",
                history[i].start_time.year,
                history[i].start_time.month,
                history[i].start_time.day,
                history[i].black_remain_time,
                history[i].white_remain_time);
    }
    
    fclose(file);
}

